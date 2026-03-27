const LANGUAGE_EXTENSIONS = {
  'C': '.c',
  'C++': '.cpp',
  'C#': '.cs',
  'Bash': '.sh',
  'Dart': '.dart',
  'Elixir': '.ex',
  'Erlang': '.erl',
  'Go': '.go',
  'Java': '.java',
  'JavaScript': '.js',
  'Kotlin': '.kt',
  'MySQL': '.sql',
  'MS SQL Server': '.sql',
  'Oracle': '.sql',
  'PHP': '.php',
  'Pandas': '.py',
  'PostgreSQL': '.sql',
  'Python': '.py',
  'Python3': '.py',
  'Racket': '.rkt',
  'Ruby': '.rb',
  'Rust': '.rs',
  'Scala': '.scala',
  'Swift': '.swift',
  'TypeScript': '.ts',
};

function getFileExtension(language) {
  return LANGUAGE_EXTENSIONS[language] || '.txt';
}
