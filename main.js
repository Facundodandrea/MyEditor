import './style.css'
import Split from 'split-grid'
import { encode, decode } from 'js-base64'
import * as monaco from 'monaco-editor'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

window.MonacoEnvironment = {
  getWorker (label) {
    if (label === 'html') return new HtmlWorker()
    if (label === 'javascript') return new JsWorker()
    if (label === 'css') return new CssWorker()
  }
}

const $ = selector => document.querySelector(selector)

Split({
  columnGutters: [{
    track: 1,
    element: document.querySelector('.vertical-gutter')
  }],
  rowGutters: [{
    track: 1,
    element: document.querySelector('.horizontal-gutter')
  }]
})

console.log('!main')

const $js = $('#js')
const $css = $('#css')
const $html = $('#html')

const { pathname } = window.location
const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

const html = decode(rawHtml)
const css = decode(rawCss)
const js = decode(rawJs)

const htmlEditor = monaco.editor.create($html, {
  value: html,
  language: 'html',
  theme: 'vs-dark',
  fontSize: 18
})
const cssEditor = monaco.editor.create($css, {
  value: css,
  language: 'css',
  theme: 'vs-dark',
  fontSize: 18
})
const jsEditor = monaco.editor.create($js, {
  value: js,
  language: 'javascript',
  theme: 'vs-dark',
  fontSize: 18
})

htmlEditor.onDidChangeModelContent(update)
jsEditor.onDidChangeModelContent(update)
cssEditor.onDidChangeModelContent(update)

const htmlForPreview = createHtml({ html, js, css })
$('iframe').setAttribute('srcdoc', htmlForPreview)

function update () {
  const html = htmlEditor.getValue()
  const css = cssEditor.getValue()
  const js = jsEditor.getValue()

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`

  window.history.replaceState(null, null, `/${hashedCode}`)

  const htmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', htmlForPreview)
}

function createHtml ({ html, js, css }) {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      ${css}
    </style>
  </head>
  <body>
  ${html}
  </body>
  <script>
    ${js}
  </script>
</html>
  `
}
