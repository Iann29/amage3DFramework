Funções Principais (Top-level)

getProject(name, config) – Função para criar ou obter um Projeto do Theatre.js com o nome especificado. Se já existir um projeto com aquele nome, ele é retornado em vez de criar um novo​
O parâmetro name é uma string identificadora, e config é um objeto opcional usado principalmente para carregar o state (estado) salvo do projeto (especialmente em produção)​
Quando o Studio (ferramenta visual) está sendo usado em desenvolvimento, é possível chamar getProject sem fornecer state no config – o estado então será gerenciado pelo Studio automaticamente
Em ambiente de produção, porém, costuma-se passar um objeto de estado exportado previamente pelo Studio para recriar as animações​

types – Objeto contendo os tipos de propriedade (prop types) suportados pelo Theatre.js. É importado de @theatre/core e permite definir explicitamente o tipo e opções de cada propriedade animável de um objeto (por exemplo: types.number, types.string, etc.), embora não seja obrigatório usá-los sempre, pois muitas vezes o tipo é inferido a partir do valor inicial​. Os tipos disponíveis são detalhados na seção Tipos de Propriedade abaixo.

onChange(pointer, callback) – Função utilitária para reagir a mudanças de valores no Theatre.js. Recebe um Pointer (apontador para um valor reativo interno) e um callback, e invoca o callback toda vez que o valor apontado mudar​. Pode ser usada, por exemplo, para observar em tempo real mudanças na posição de uma sequência ou nos props de um objeto (ver seção Pointers e reatividade).

val(pointer) – Função utilitária que retorna o valor atual apontado por um Pointer. Útil para ler diretamente o valor atual de alguma propriedade reativa dentro do Theatre.js​. Por exemplo, val(obj.props.x) retornaria o valor numérico atual da prop x de um objeto.

