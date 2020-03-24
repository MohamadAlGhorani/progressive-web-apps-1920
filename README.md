# Progressive Web Apps @cmda-minor-web · 2019-2020

<img width="1280" alt="Screenshot 2020-03-24 at 13 53 10" src="https://user-images.githubusercontent.com/45425087/77427516-d7d96900-6dd6-11ea-8c28-b812aa3b11eb.png">

## [online Demo](https://which-movies.herokuapp.com/movies)

## The concept
### which-movies
Which movies web application is an application for searching and watching trailars from all the movies and to get information about the movies and their ratings so you can eazy choose a movie to watch.

## Features
- Overview page with: Popular movies, Top rated movies, Upcoming movies, Now playing movies
- Details page for each movie with trailars
- Filter on genres 
- search function to search for a specific movie or title 
- It works offline 
- You can install it on your device.

## Optimize the performance
### Perceived load speed:
Wat ik gedaan heb om deze te optimizen is dat ik een [compression](https://github.com/expressjs/compression) heb gebruikt om het laden van de pagina sneller te maken.
compression is ondersteund door gizp.
```js
const compression = require("compression");
app.use(compression())
```
Daarnaast door gulp clean css te gebruiken kan ik de bestanden allemaal aan elkaar toevoegen met gulp concat en met ```js cleanCss()``` heb ik mijn CSS minifyed.
```js
  .src(["./src/css/*.css"])
  .pipe(concat("index.css"))
  .pipe(cleanCss())
```
Daarna heb ik hem getest op [WebPageTest](https://www.webpagetest.org/)
resultaat voor het gebruik maken van compression 
<img width="980" alt="Screenshot 2020-03-23 at 17 15 17" src="https://user-images.githubusercontent.com/45425087/77338429-a60ac880-6d2a-11ea-89cb-c0b3dcd56b9c.png">
resultaat na het gebruik maken van compression 
<img width="986" alt="Screenshot 2020-03-23 at 17 15 09" src="https://user-images.githubusercontent.com/45425087/77338481-b7ec6b80-6d2a-11ea-9fd3-eec89f266950.png">
### Load responsiveness: 
#### [Service-worker](https://github.com/MohamadAlGhorani/progressive-web-apps-1920/blob/master/src/service-worker.js)
Ik heb service worker toegevoegd aan mijn applicatie zodat het applicate beter in performance scored door service worker te gebruiken wekrkt mijn applicatie offline bij de paginas die eerder bezocht waren. Daarnaast als de gebruiker voor de tweede keer naar mijn website komt krijgt de gebruiker de gecahchede files en op deze manier heb ik controle over de network en over hoe snel de gebruiker iets krijgt op zijn scherm. 

Dit is de eerste keer de gebruiker de website bezoekt.

<img width="972" alt="Screenshot 2020-03-23 at 17 53 06" src="https://user-images.githubusercontent.com/45425087/77427580-efb0ed00-6dd6-11ea-81a1-660abd10e9ea.png">

Dit is de tweede keer de gebruiker de website bezoekt.

558" alt="Screenshot 2020-03-24 at 13 55 56" src="https://user-images.githubusercontent.com/45425087/77427750-330b5b80-6dd7-11ea-9dbe-b21966d4053a.png">

Dus snel zoals de licht.

### The low hanging fruits
Ik heb een test gedraait op lighthouse en uit de test kwam dat ik een paar dingin makkelijk kan aanpassen om mijn app te verbeteren.

Ik heb de volgende issues opgelost die uit de test kwamen.
- adding meta descriptions ``` <meta name="Description" content="Author: Mohamad Al Ghorani,
	Designer: Mohamad Al Ghorani, Category: Movies,">```
- adding meta name theme-color 		``` <meta name="theme-color" content="#5e00ff"/> ```
- adding apple touch icon``` <link rel="apple-touch-icon" href="/icons/logo.png">```
- adding max-age for the cache 
```js
 app.use((req, res, next) => {
    res.header('Cache-Control', 'max-age=2592000000');
    next();
});
```
- ik heb alle ```js console.log()``` verwijdert van mijn app
### Visual stability:
Wat ik gedaan heb om deze probleem op te lossen is het vaste ``` width:;  height:;``` voor de afbeeldingen te geven in de app.
op deze manier wordt er geen onverwachte shifting in het layout als de gebruiker op een traage verbinding is.

### Font-system
Om het probleem op te lossen van het custom fonts heb ik voor mijn hele applicatie font system gebruikt 
om hem meer app-like te maken ```* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}```
## Installation
- Download [Node.js](https://nodejs.org/en/) if you don't have it. 
- Clone this repository.
- Navigate to the folder of the repository using your terminal.
- Write in your terminal ```npm install``` to download the node modules.
- Run ``` npm run dev ``` in your terminal to open the porject in your brwoser using localhost:3000/

## APi
I used [THE MOVIE DB](https://www.themoviedb.org/?language=en-US) api to get all the data about the movies and their video trailars.
If you want to use this API you have to make an account to ask for a key that you can use to access the data.

## License
License is [MIT](https://github.com/MohamadAlGhorani/progressive-web-apps-1920/blob/master/LICENSE) 
