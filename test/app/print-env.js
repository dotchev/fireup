for (var i = 2; i < process.argv.length; ++i) {
  console.log(process.argv[i] + '=' + process.env[process.argv[i]]);
}
