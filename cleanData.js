import fs from 'fs';
const articlesData = fs.readFileSync('articles_full_text.txt', { encoding: 'UTF-8' });
const stream = fs.createWriteStream('clean_full_articles.txt');

const trimArticles = () => {
    const caseIdRegex = new RegExp(/[0-9]*\|/, 'g')
    const articlesArray = articlesData.split('\n');
    const trimmedArticlesArray = articlesArray.map(item => item.trim()).filter(item => !!item);
    const articlesObj = {};
    let key;
    trimmedArticlesArray.forEach(item => {
        if (caseIdRegex.test(item)){
            key = item;
        } else {
            articlesObj[key] = articlesObj[key]? articlesObj[key] + ". " + item: item;
        }
    })
    return articlesObj;
};

const writeCleanArticlesToFile = (articles) => {
    for (const caseId in articles) {
        const fullArticle = articles[caseId].replace('..', '.');
        stream.write(caseId + fullArticle + '\r\n');
    }
};

const trimmedArticles = trimArticles();

writeCleanArticlesToFile(trimmedArticles);

