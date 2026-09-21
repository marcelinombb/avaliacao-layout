# Commits e Releases

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/), validados automaticamente via Husky + commitlint, e [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) (sucessor do standard-version) para gerar changelog, bump de versão e tag de release.

## Fluxo de uso

1. **Commitar seguindo o padrão**

   ```bash
   npm run commit
   ```

   Abre um prompt interativo (commitizen) que monta a mensagem no formato correto (`feat:`, `fix:`, `chore:`, etc.).

   - O hook `pre-commit` roda o `lint-staged` (formatação automática via Prettier).
   - O hook `commit-msg` valida e rejeita qualquer mensagem fora do padrão Conventional Commits.

2. **Verificações antes do release**

   Antes de gerar uma nova versão, certifique-se de que a build e os linters passam:

   ```bash
   npm run lint
   npm run build
   ```

3. **Lançar uma versão**

   ```bash
   npm run release
   ```

   Analisa os commits desde a última tag, calcula a próxima versão semântica (major/minor/patch), atualiza o `package.json` (e `package-lock.json`), gera/atualiza o `CHANGELOG.md` na raiz, cria o commit de release e a tag Git correspondente.

   Para forçar um tipo específico de bump:

   ```bash
   npm run release:patch
   npm run release:minor
   npm run release:major
   ```

   Para simular sem alterar arquivos nem criar tags:

   ```bash
   npm run release:dry-run
   ```

4. **Publicar**

   Envie as tags para o repositório remoto e publique o pacote no npm (o script executa o build antes da publicação):

   ```bash
   git push --follow-tags origin <branch>
   npm run publish:npm
   ```
