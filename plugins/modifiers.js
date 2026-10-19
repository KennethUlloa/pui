/**
 * 
 * @param {(content: string) => string} callback 
 */
export function modifyHtmlFiles(callback) {

  return {
    name: 'modify-specific-html-files',

    transformIndexHtml: {
      order: 'post',

      handler(html, ctx) {
        if (!ctx.path.endsWith('.html')) return

        return callback(html)
      },
    },
  }
}