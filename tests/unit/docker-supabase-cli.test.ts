import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Docker Supabase CLI integration', () => {
  it('excludes local env files and Supabase runtime metadata from builds', () => {
    const dockerignore = source('.dockerignore');

    for (const pattern of [
      '**/.env',
      '**/.env.*',
      'supabase/.temp',
      'supabase/.temp/**',
      '**/supabase/.temp',
      '**/supabase/.temp/**',
      '**/supabase/**/.temp',
      '**/supabase/**/.temp/**',
    ]) {
      expect(dockerignore.split('\n')).toContain(pattern);
    }

    expect(dockerignore.split('\n')).toContain('!.env.example');
    expect(dockerignore.split('\n')).not.toContain('!**/.env.example');
  });

  it('builds a pinned CLI image with Docker available at runtime', () => {
    const dockerfile = source('Dockerfile');

    expect(dockerfile).toContain('FROM deps AS supabase-cli');
    expect(dockerfile).toContain('apk add --no-cache docker-cli');
    expect(dockerfile).toContain('pnpm exec supabase --version');
    expect(dockerfile).toContain(
      'ENTRYPOINT ["/app/node_modules/.bin/supabase"]',
    );
    expect(source('package.json')).toContain('"supabase": "2.111.0"');
  });

  it('keeps the privileged CLI helper opt-in and separate from dev', () => {
    const compose = source('docker-compose.yml');
    const helperStart = compose.indexOf('  supabase-cli:');
    const devStart = compose.indexOf('  dev:');
    const helper = compose.slice(helperStart, devStart);
    const dev = compose.slice(
      devStart,
      compose.indexOf('\n  build:\n', devStart),
    );

    expect(helperStart).toBeGreaterThan(-1);
    expect(devStart).toBeGreaterThan(helperStart);
    expect(helper).toContain("profiles: ['tools']");
    expect(helper).toContain('target: supabase-cli');
    expect(helper).toContain('network_mode: host');
    expect(helper).toContain("user: '0:0'");
    expect(helper).toContain(
      'working_dir: ${PWD:?Ejecuta Docker Compose desde la raiz del repositorio}',
    );
    expect(helper).toContain('source: /var/run/docker.sock');
    expect(helper).toContain('target: /var/run/docker.sock');
    expect(helper.match(/\$\{PWD:\?Ejecuta Docker Compose/g)).toHaveLength(3);
    expect(helper).toContain("command: ['--help']");
    expect(helper).not.toMatch(/PUBLIC_SUPABASE|service[_-]?role|sb_secret_/i);

    expect(dev).toContain('target: dev');
    expect(dev).toContain('- .:/app');
    expect(dev).not.toMatch(/profiles|docker\.sock|network_mode: host/);
  });
});
