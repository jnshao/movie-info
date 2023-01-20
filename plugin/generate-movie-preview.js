const fs = require('fs');
const path = require('path');
const markdownMagic = require('markdown-magic');
const coverImagePath = '../cover_img';

const generateMovieAnchor = (title) => {
    const anchor = title.split(' ').join('-').toLowerCase().replace(/:|：|\(|\)|,/g,'');
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
const getMovieInfoFiles = async (dirPath) => {
    const files = await fs.promises.readdir(dirPath);
    return files.filter(file => path.extname(file) === '.json');
};

const config = {
    matchWord: 'AUTO-PREVIEW',
    transforms: {
        /**
         * <!-- AUTO-PREVIEW:START (RENDERPREVIEW:path=./movie_info/&listType={watched/candidate/undefined}) -->
         */
        async PRINTLIST(content, options) {
            try {
                let movieList = '';
                const movieInfoFiles = await getMovieInfoFiles(options.path);
                movieInfoFiles.forEach((file) => {
                    const movieInfo = JSON.parse(fs.readFileSync(`${options.path}/${file}`));

                    if ((options.listType === 'watched' && !movieInfo.watched) ||
                            (options.listType === 'candidate' && movieInfo.watched)) {
                        return;
                    }
                    movieList += ` - ${movieInfo.title}\n`;
                })
                return movieList;
            } catch (e) {
                console.log('Error: ', e);
            }
        },
        async RENDERPREVIEW(content, options) {
            try {
                let previewMovieAnchor = '';
                let previewMovieContent = '';
                const movieInfoFiles = await getMovieInfoFiles(options.path);
                movieInfoFiles.forEach((file) => {
                    const movieInfo = JSON.parse(fs.readFileSync(`${options.path}/${file}`));

                    if ((options.listType === 'watched' && !movieInfo.watched) ||
                            (options.listType === 'candidate' && movieInfo.watched)) {
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
    path.join(__dirname, '..', `README.md`),
    getPreviewPath('MovieList.md'),
    getPreviewPath('Watched.md'),
    getPreviewPath('Candidate.md'),
];
markdownMagic(previewFiles, config, () => {
    console.log('Finished');
})
