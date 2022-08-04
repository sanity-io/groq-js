// import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

function chunk(input, name, format, ext) {
  return [
    {
      input: `src/${input}.ts`,
      output: {
        file: `dist/${name}.${format}.${ext}`,
        format,
        name,
        compact: true,
      },
      plugins: [typescript()],
    },
    {
      input: `src/${input}.ts`,
      output: {
        file: `dist/${name}.${format}.d.ts`,
        format,
        name,
        compact: true,
      },
      plugins: [dts()],
    },
  ]
}

export default [...chunk('1', '1', 'umd', 'cjs'), ...chunk('1', '1', 'esm', 'mjs')]
