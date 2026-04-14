export const coderunnerType = {
  cFunction: "c_function",
  cProgram: "c_program",
  cppFunction: "cpp_function",
  cppProgram: "cpp_program",
  directedGraph: "directed_graph",
  javaClass: "java_class",
  javaMethod: "java_method",
  javaProgram: "java_program",
  multilanguage: "multilanguage",
  nodejs: "nodejs",
  octaveFunction: "octave_function",
  pascalFunction: "pascal_function",
  pascalProgram: "pascal_program",
  php: "php",
  python2: "python2",
  python3: "python3",
  python3WithInput: "python3_w_input",
  sql: "sql",
  undirectedGraph: "undirected_graph",
} as const;

export const precheck = {
  disabled: "0",
  empty: "1",
  examples: "2",
  selected: "3",
  all: "4",
} as const;

export const testType = {
  normal: "0",
  precheck: "1",
  both: "2",
} as const;

export const feedback = {
  useQuiz: "0",
  show: "1",
  hide: "2",
} as const;

export const giveUp = {
  never: "0",
  afterMaxMarks: "1",
  always: "2",
} as const;
