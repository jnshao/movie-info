const fs = require('fs');
const path = require('path');
const markdownMagic = require('markdown-magic');
const coverImagePath = './cover_img';

const generateMovieList = (title) => {
    const anchor = title.split(' ').join('-').toLowerCase().replace(/\(|\)|,/g,'');
    return `- [${title}](#${anchor})\n`;
};
const generateMovieInfo = (json) => {
    return  `## [${json.title}](${json.imdb})\n` +
            `### 片長：${json.time}\n` +
            `${json.description}\n\n` +
            `[<img src='${coverImagePath}/${json.cover}' height='570px' width='400px' />](${json.trailer})\n` +
            `\n---\n`;
};

const config = {
    matchWord: 'AUTO-PREVIEW',
    transforms: {
        /**
         * <!-- AUTO-PREVIEW:START (RENDERPREVIEW:path=./movie_info/) -->
         */
        async RENDERPREVIEW(content, options) {
            let previewMovieList = '';
            let previewMovieContent = '';
            try {
                let files = await fs.promises.readdir(options.path);
                files = files.filter(file => path.extname(file) === '.json');
                files.forEach((file) => {
                    let movieInfo = JSON.parse(fs.readFileSync(`${options.path}/${file}`));
                    previewMovieList += generateMovieList(movieInfo.title);
                    previewMovieContent += generateMovieInfo(movieInfo);
                })
            } catch (e) {
                console.log('Error: ', e);
                return;
            }
            return  `${previewMovieList}\n` +
                    `---\n` +
                    `${previewMovieContent}`;
        }
    }
}

const markdownPath = path.join(__dirname, '..', 'README.md')
markdownMagic(markdownPath, config, () => {
    console.log('Finished');
})
