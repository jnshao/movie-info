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
    return sections.join('\n---\n');
};

const config = {
    matchWord: 'AUTO-PREVIEW',
    transforms: {
        /**
         * <!-- AUTO-PREVIEW:START (RENDERPREVIEW:path=./movie_info/&listType={watched/candidate/undefined}) -->
         */
        async RENDERPREVIEW(content, options) {
            try {
                let previewMovieAnchor = '';
                let previewMovieContent = '';
                let movieInfoFiles = await fs.promises.readdir(options.path);

                movieInfoFiles = movieInfoFiles.filter(file => path.extname(file) === '.json');
                movieInfoFiles.forEach((file) => {
                    const movieInfo = JSON.parse(fs.readFileSync(`${options.path}/${file}`));

                    if (options.listType === 'watched' && !movieInfo.watched) {
                        return;
                    } else if (options.listType === 'candidate' && movieInfo.watched) {
                        return;
                    }
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
    getPreviewPath('Watched.md'),
    getPreviewPath('Candidate.md'),
];
markdownMagic(previewFiles, config, () => {
    console.log('Finished');
})
