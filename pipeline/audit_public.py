#!/usr/bin/env python3
"""Leak audit before (and after) the repo is public. Run from the repo root.

  python3 pipeline/audit_public.py            # every blob in the whole history + commit messages
  python3 pipeline/audit_public.py --staged   # only lines added in the staged diff (the pre-commit hook)

Flags: credentials and keys, personal home-directory paths, e-mail addresses other than GitHub no-reply and
Anthropic's co-author line, agent scratchpad paths, signed URLs, and any tracked PDF/EPUB/Office file or file under
sources/ (copyrighted course material stays local; see .gitignore). The copyright check against sources/ (8-word
overlaps) lives in app/src/content/verbatim.test.ts for the app, and in --verbatim here for every tracked text file.
Exit code 1 on any finding.
"""
import collections, glob, re, subprocess, sys

PATTERNS = {
    'home path': re.compile(rb'/Users/(?!a/)[A-Za-z0-9_.-]+/|/home/[a-z][a-z0-9_-]+/|-Users-[A-Za-z0-9_.]+-'),
    'e-mail': re.compile(rb'[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com|anthropic\.com|example\.(?:com|org))[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:com|edu|org|net|io|me|co|uk|in)\b'),
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
BLOCKED_PATH = re.compile(r'(^|/)sources/|\.(pdf|epub|docx?|pptx?|xlsx?|pem|p12|key)$|(^|/)\.env(\.|$)', re.I)


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, check=True).stdout


def scan(data, where, found):
    for name, rx in PATTERNS.items():
        for m in rx.finditer(data):
            found[name].add(f'{where}: {m.group(0)[:80].decode("utf8", "replace")}')


def staged(found):
    for f in git('diff', '--cached', '--name-only', '--diff-filter=AR').decode().splitlines():
        if BLOCKED_PATH.search(f):
            found['blocked file'].add(f)
    diff = git('diff', '--cached', '-U0', '--no-color')
    path = '?'
    for line in diff.split(b'\n'):
        if line.startswith(b'+++ b/'):
            path = line[6:].decode('utf8', 'replace')
        elif line.startswith(b'+') and not line.startswith(b'+++') and path != 'pipeline/audit_public.py':
            scan(line, path, found)


def history(found):
    paths = collections.defaultdict(set)
    for line in git('rev-list', '--objects', '--all').decode().splitlines():
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
            scan(data, sorted(ps)[0], found)
    scan(git('log', '--all', '--format=%H %an <%ae> %cn <%ce>%n%B'), 'commit messages', found)


def verbatim(found, n=8):
    words = re.compile(r"[a-z]+(?:'[a-z]+)?")
    src = set()
    for f in glob.glob('sources/*/text.md'):
        w = words.findall(open(f, errors='ignore').read().lower())
        src.update(' '.join(w[i:i + n]) for i in range(len(w) - n + 1))
    if not src:
        print('verbatim: sources/ is not present here; skipped')
        return
    for f in git('ls-files').decode().splitlines():
        if not re.search(r'\.(md|ts|tsx|py|txt|html|css|sh)$', f):
            continue
        w = words.findall(open(f, errors='ignore').read().lower())
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
    else:
        history(found)
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
