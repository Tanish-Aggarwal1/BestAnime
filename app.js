'use strict';

/*
    Author:       Tanish Aggarwal
    Program:      best_anime.js
    Date:         August 7, 2024
    Updated:      -
    Version:      1.0
    Purpose:      To find the best-rated anime of a given year and display it with an appropriate background image
    Copyright:    
        The materials provided in class and through SLATE are protected by copyright. They are intended 
        for the personal, educational uses of students in this course and should not be shared externally 
        or on websites such as Course Hero or OneClass. Unauthorized distribution may result in copyright 
        infringement and violation of Sheridan policies.
    Citations:    
        Original source material can be found (subject to original author's copyrights):
    Description: 
        1. This program finds the best-rated anime of a given year.
        2. If the anime image is not found, it fetches an alternative wallpaper.
        3. Displays an interesting anime fact if the year is not within the specified range.
*/

// Importing necessary modules
const express = require('express');
const app = express();
const bestAnime = require('anime-package-assignment4'); 
const Client = require('waifu.it');
const https = require('https');
const http = require('http');
const path = require("path"); 
const { AnimeWallpaper, AnimeSource } = require('anime-wallpaper');
const wallpaper = new AnimeWallpaper();

// Function to check if a URL returns a 404 error
function checkURL(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        client.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log(`${url} is accessible`);
                resolve(true);
            } else if (res.statusCode === 404) {
                console.log(`${url} returned 404 Not Found`);
                resolve(false);
            } else {
                console.log(`${url} returned status code ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', (e) => {
            console.log(`Error accessing ${url}:`, e.message);
            resolve(false);
        });
    });
}

// Replace <TOKEN> with your API Token
const api1 = new Client("NzE4NzI1NTI0NDEwNTk3NDM3.MTcyMjkxMDAzMQ--.dcaa325c3b4");

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');


app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/bestAnime', (req, res) => {
    res.render('index');
});

app.post('/getAnime', async (req, res) => {
    const year = req.body.year;
    if (1975 > year || year > 2023) {
        try {
            const f = await api1.getFact();
            const fact = f.fact;
            console.log(fact);
            res.render('error', { year: year, fact: fact });
        } catch (error) {
            console.error('Error fetching anime fact:', error);
            res.render('error', { year: year, fact: 'Could not fetch anime fact' });
        }
    } else {
        const a1 = bestAnime(year);
        console.log(a1);
        const title = a1.title;
        const img = a1.img;
        const rating = a1.rating;
        console.log(img);
        console.log(rating);
        
        const isAccessible = await checkURL(img);
        if (isAccessible) {
            res.render('result', { year: year, title: title, img: img, rating: rating });
        } else {
            try {
                const wallpapers = await wallpaper.search({ title: title, page: 1, type: "sfw", aiArt: true }, AnimeSource.WallHaven);
                if (wallpapers.length > 0) {
                    const wallpaperImg = wallpapers[0].image;
                    console.log(wallpaperImg)
                    res.render('result', { year: year, title: title, img: wallpaperImg, rating: rating });
                } else {
                    console.log('no wallpaper')
                    res.render('result', { year: year, title: title, img: 'No wallpaper found', rating: rating });
                }
            } catch (error) {
                console.error('Error fetching wallpaper:', error);
                res.render('result', { year: year, title: title, img: 'Could not fetch wallpaper', rating: rating });
            }
        }
    }
});

app.use("/bestAnime", express.static(path.join(__dirname, "public")));

app.listen(app.get('port'), () => {
    console.log('running on ' + app.get('port'));
});
