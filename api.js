const express = require('express');
const bodyParser = require('body-parser');
const contentDisposition = require('content-disposition');
const cors = require('cors');
const render = require('./render');
const purifycss = require('purify-css');
const api = express();
api.use(bodyParser.json({limit: '10mb'}));
api.use(bodyParser.urlencoded({extended: false, limit: '10mb'}));
api.disable('x-powered-by');
api.use(cors());

api.post('/getpdf', async (req, res, next) => {
    const html = await `<!doctype html>
                <html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
                <head>
                    <base href="${req.headers.origin}">
                    <title>Receipt ${new Date().getTime()}</title>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style media="all">${purifycss(req.body.content, req.body.styles, {// Will minify CSS code in addition to purify.
                                minify: true,
                                // Logs out removed selectors.
                                rejected: true,
                                info: true,
                                whitelist: ['*prh*', 'body']
                            })}</style>
                </head>
                <body>${req.body.content}</body>
            </html>`;
    const stream = await render(html, req.headers);
    res.set({
        'Content-Type': 'application/pdf',
    });

    stream.pipe(res);
});

// Error page.
api.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!')
});


// Terminate process
process.on('SIGINT', () => {
    process.exit(0);
});

module.exports = api;