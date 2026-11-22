#!/usr/bin/env python3
"""Leak audit before (and after) the repo is public. Run from the repo root.

  python3 pipeline/audit_public.py            # every blob in the whole history + commit messages
  python3 pipeline/audit_public.py --staged   # only lines added in the staged diff (the pre-commit hook)
  python3 pipeline/audit_public.py --range BASE..HEAD   # only the commits (and their blobs) of one pull request

Flags: credentials and keys, personal home-directory paths, e-mail addresses other than GitHub no-reply and
Anthropic's co-author line, agent scratchpad paths, signed URLs, and any tracked PDF/EPUB/Office file or file under
sources/ (copyrighted course material stays local; see .gitignore). The copyright check against sources/ (8-word
overlaps) lives in app/src/content/verbatim.test.ts for the app, and in --verbatim here for every tracked text file.
Exit code 1 on any finding.
"""
import collections, glob, os, re, subprocess, sys

PATTERNS = {
    'home path': re.compile(rb'/Users/(?!a/)[A-Za-z0-9_.-]+/|/home/[a-z][a-z0-9_-]+/|-Users-[A-Za-z0-9_.]+-'),
    'e-mail': re.compile(rb'[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com|anthropic\.com|example\.(?:com|org))[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,12}\b'),
    # Added later than the rest: two old commits still hold such lines (history is deliberately not rewritten), so this
    # rule runs on new content only (--staged, --range, and the current tracked files), never on the whole history.
    'local file path': re.compile(rb'~/(?:Downloads|Documents|Desktop)/'),
    'scratchpad path': re.compile(rb'/private/tmp/claude|/tmp/claude-\d'),
    'Anthropic key': re.compile(rb'sk-ant-[A-Za-z0-9_-]{10,}'),
    'OpenAI key': re.compile(rb'\bsk-(?:proj-)?[A-Za-z0-9]{32,}'),
    'GitHub token': re.compile(rb'\bgh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}'),
    'AWS key': re.compile(rb'\bAKIA[0-9A-Z]{16}\b'),
    'Google key': re.compile(rb'\bAIza[0-9A-Za-z_-]{35}\b'),
    'private key': re.compile(rb'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
    'JWT': re.compile(rb'eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}'),
    'assigned secret': re.compile(rb'(?i)(?:api[_-]?key|secret|token|passw(?:or)?d|bearer)["\']?\s*[:=]\s*["\'][A-Za-z0-9/+_.-]{16,}["\']'),
    'signed URL': re.compile(rb'[?&](?:X-Amz-Signature|Signature|sig|token)=[A-Za-z0-9%_.-]{16,}'),
}
MEDIA_PATH = re.compile(r'\.(png|jpe?g|gif|webp|avif|heic|tiff?|bmp|ico|mp4|mov|m4v|webm|mkv|glb|gltf)$', re.I)
MEDIA_EMAIL = re.compile(rb'(?<![A-Za-z0-9])[A-Za-z0-9._%+-]{3,}@(?!users\.noreply\.github\.com|anthropic\.com)[A-Za-z0-9-]{3,}(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,12}(?![A-Za-z0-9])')
HISTORY_SKIP = ('local file path',)
MEDIA_PATTERNS = ('home path', 'local file path', 'scratchpad path')  # + MEDIA_EMAIL  # metadata leaks in binary files: paths, user names, addresses
BLOCKED_PATH = re.compile(r'(^|/)sources/|\.(pdf|epub|docx?|pptx?|xlsx?|pem|p12|key)$|(^|/)\.env(\.|$)', re.I)


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, check=True).stdout


def scan(data, where, found, skip=(), media=False):
    for name, rx in PATTERNS.items():
        if name in skip or (media and name == 'e-mail'):
            continue
        for m in rx.finditer(data):
            found[name].add(f'{where}: {m.group(0)[:80].decode("utf8", "replace")}')
    if media:  # random bytes in a compressed image look like short addresses, so the e-mail rule is stricter there
        for m in MEDIA_EMAIL.finditer(data):
            found['e-mail'].add(f'{where}: {m.group(0)[:80].decode("utf8", "replace")}')


def staged(found):
    for f in git('diff', '--cached', '--name-only', '--diff-filter=AR').decode().splitlines():
        if BLOCKED_PATH.search(f):
            found['blocked file'].add(f)
        elif MEDIA_PATH.search(f):
            data = git('cat-file', 'blob', ':' + f)  # the staged bytes: the diff shows only "Binary files differ"
            scan(data, f, found, skip=tuple(n for n in PATTERNS if n not in MEDIA_PATTERNS), media=True)
    diff = git('diff', '--cached', '-U0', '--no-color')
    path = '?'
    for line in diff.split(b'\n'):
        if line.startswith(b'+++ b/'):
            path = line[6:].decode('utf8', 'replace')
        elif line.startswith(b'+') and not line.startswith(b'+++') and path != 'pipeline/audit_public.py':
            scan(line, path, found)


def history(found, revs=('--all',)):
    paths = collections.defaultdict(set)
    for line in git('rev-list', '--objects', *revs).decode().splitlines():
        sha, _, p = line.partition(' ')
        if p:
            paths[sha].add(p)
            if BLOCKED_PATH.search(p):
                found['blocked file'].add(p)
    cat = subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    for sha, ps in paths.items():
        if ps == {'pipeline/audit_public.py'}:
            continue
        cat.stdin.write(sha.encode() + b'\n'); cat.stdin.flush()
        hdr = cat.stdout.readline().split()
        size = int(hdr[2]); data = cat.stdout.read(size); cat.stdout.read(1)
        if hdr[1] == b'blob':
            scan(data, sorted(ps)[0], found, skip=HISTORY_SKIP if len(revs) == 1 and revs[0] == '--all' else (),
                 media=all(MEDIA_PATH.search(x) for x in ps))
    scan(git('log', *revs, '--format=%H %an <%ae> %cn <%ce>%n%B'), 'commit messages', found)


def tracked(found):
    """The current tracked text files, for the rules that history is exempt from (see HISTORY_SKIP)."""
    for f in git('ls-files').decode().splitlines():
        if f != 'pipeline/audit_public.py' and not MEDIA_PATH.search(f) and os.path.isfile(f):
            scan(open(f, 'rb').read(), f, found, skip=tuple(n for n in PATTERNS if n not in HISTORY_SKIP))


def verbatim(found, n=8):
    words = re.compile(r"[a-z]+(?:'[a-z]+)?")
    # TeX command names (\\langle, \\pmatrix, ...) are notation, not prose: a run of them is shared by any two texts that
    # typeset the same matrix or bra-ket. Dropping them from both sides leaves every real sentence comparable.
    tex = re.compile(r'\\[A-Za-z]+')
    def tokens(text):
        return words.findall(tex.sub(' ', text).lower())
    src = set()
    for f in [f for f in glob.glob('sources/**/*.md', recursive=True) if not f.startswith('sources/research/')]:
        w = tokens(open(f, errors='ignore').read())
        src.update(' '.join(w[i:i + n]) for i in range(len(w) - n + 1))
    if not src:
        print('verbatim: sources/ is not present here; skipped')
        return
    for f in git('ls-files').decode().splitlines():
        if not re.search(r'\.(md|ts|tsx|py|txt|html|css|sh|json|jsonc|tsv|ya?ml|mjs|js|svg)$', f):
            continue
        w = tokens(open(f, errors='ignore').read())
        run = 0
        for i in range(len(w) - n + 1):
            g = w[i:i + n]
            prose = sum(len(x) >= 3 for x in g) >= 5
            run = run + 1 if (prose and ' '.join(g) in src) else 0
            if run == 5:  # 12 or more consecutive words shared with a source: a quotation, not a stock phrase
                found['verbatim (12+ words)'].add(f'{f}: "{" ".join(w[i - 4:i + n])[:100]}"')


if __name__ == '__main__':
    found = collections.defaultdict(set)
    if '--staged' in sys.argv:
        staged(found)
    elif '--range' in sys.argv:
        history(found, (sys.argv[sys.argv.index('--range') + 1],))
    else:
        history(found)
        tracked(found)
    # --verbatim also runs with --staged (the pre-commit hook), so a copied source sentence cannot even be committed.
    if '--verbatim' in sys.argv:
        verbatim(found)
    for name, items in found.items():
        print(f'== {name} ({len(items)})')
        for it in sorted(items)[:15]:
            print('   ', it)
    if found:
        print('Leak audit FAILED. Remove or ignore the items above (git reset <file> to unstage).', file=sys.stderr)
        sys.exit(1)
    print('Leak audit: clean.')
