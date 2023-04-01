import './style.css'
import Split from 'split-grid'
import { encode, decode } from 'js-base64'
import * as monaco from 'monaco-editor'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'

window.MonacoEnvironment = {
  getWorker (label) {
    if (label === 'html') return new HtmlWorker()
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

const htmlEditor = monaco.editor.create($html, {
  value: '',
  language: 'html',
  theme: 'vs-dark',
  fontSize: 18
})

console.log(htmlEditor)

htmlEditor.onDidChangeModelContent(update)
$js.addEventListener('input', update)
$css.addEventListener('input', update)

function init () {
  const { pathname } = window.location
  const [rawHtml, rawCss, rawJs] = pathname.slice(1).split('%7C')

  const html = decode(rawHtml)
  const css = decode(rawCss)
  const js = decode(rawJs)

  // $html.value = html
  $css.value = css
  $js.value = js

  const htmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', htmlForPreview)
}

function update () {
  const html = htmlEditor.getValue()
  const css = $css.value
  const js = $js.value

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`

  window.history.replaceState(null, null, `/${hashedCode}`)

  const htmlForPreview = createHtml({ html, js, css })
  $('iframe').setAttribute('srcdoc', htmlForPreview)
}

const createHtml = ({ html, js, css }) => {
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

init()
