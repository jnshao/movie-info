const fs = require('fs');
const path = require('path');
const markdownMagic = require('markdown-magic');
const coverImagePath = '../cover_img';

const generateMovieAnchor = (title) => {
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
const generatePreview = (...sections) => {
    let result = '';
    sections.forEach(section => {
        result += section + '\n---\n';
    })
    return result;
};

const config = {
    matchWord: 'AUTO-PREVIEW',
    transforms: {
        /**
         * <!-- AUTO-PREVIEW:START (RENDERPREVIEW:path=./movie_info/) -->
         */
        async RENDERPREVIEW(content, options) {
            try {
                let previewMovieAnchor = '';
                let previewMovieContent = '';
                let files = await fs.promises.readdir(options.path);
                files = files.filter(file => path.extname(file) === '.json');
                files.forEach((file) => {
                    const movieInfo = JSON.parse(fs.readFileSync(`${options.path}/${file}`));
                    previewMovieAnchor += generateMovieAnchor(movieInfo.title);
                    previewMovieContent += generateMovieInfo(movieInfo);
                })
                return generatePreview(previewMovieAnchor, previewMovieContent);
            } catch (e) {
                console.log('Error: ', e);
            }
        }
    }
}

const getPreviewPath = (file) => path.join(__dirname, '..', `preview/${file}`);
const previewFiles = [
    getPreviewPath('MovieList.md'),
];
markdownMagic(previewFiles, config, () => {
    console.log('Finished');
})
