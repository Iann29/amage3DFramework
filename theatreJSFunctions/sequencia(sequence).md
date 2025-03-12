
A **Sequência** de uma Sheet é responsável por armazenar e controlar os dados de animação ao longo do tempo – em outras palavras, é a timeline que contém os keyframes das propriedades animadas e permite dar play/pause. Seguem os comandos principais:

### `sequence.play(opts?)`
- Inicia a reprodução da animação a partir da posição atual.
- Aceita um objeto opcional (`opts`) com:
  - **`rate`**: Velocidade de reprodução (1.0 é normal).
  - **`range: [início, fim]`**: Intervalo específico (em segundos) da sequência a ser reproduzido.
  - **`iterationCount`**: Quantas vezes a animação repete (`Infinity` para repetição infinita).
  - **`direction`**: `'normal'`, `'reverse'`, `'alternate'`, `'alternateReverse'`.
  - **`rafDriver`**: Customiza o loop de animação (opcional, avançado).

### `sequence.pause()`
- Pausa a animação imediatamente.

### `sequence.position`
- Permite obter ou definir diretamente a posição atual (em segundos) da timeline.

### `sequence.pointer`
- Permite acesso reativo às propriedades internas da sequência:
  - **`.length`**: Duração total da animação em segundos.
  - **`.position`**: Posição atual do playhead.
  - **`.playing`**: Indica se a animação está tocando (`true` ou `false`).

### `sequence.attachAudio(opts)`
- Anexa um áudio sincronizado à animação.
- `opts` pode incluir:
  - **`source`**: URL ou objeto `AudioBuffer`.
  - **`audioContext`**: Um contexto de áudio personalizado (opcional).
  - **`destinationNode`**: Um nó personalizado para saída do áudio (opcional).

### `sequence.__experimental_getKeyframes(pointer)`
- Experimental: obtém dados dos keyframes para uma propriedade específica usando um Pointer.
- Disponível desde a versão 0.6.1 (API pode mudar futuramente).

### `sequence.pause()`
- Pausa a reprodução da animação imediatamente.

### `sequence.position`
- Permite consultar ou definir manualmente o tempo atual da sequência em segundos.
- Útil para saltar diretamente para um tempo específico da animação.

Esses comandos formam a base para controlar e manipular animações detalhadamente em aplicações interativas na web.

