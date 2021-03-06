document.addEventListener('DOMContentLoaded',()=>{
    submitSearch()
})

// type in a name of a tv show and see a list of results (submit event)
function submitSearch(){
    const search = document.getElementById('search')
    search.addEventListener('submit', (e)=>{
        e.preventDefault()
        fetchResults(search.show.value)
        search.reset()
    })
}

function fetchResults(showTitle){
    fetch(`https://api.tvmaze.com/search/shows?q=${showTitle}`)
    .then(resp => resp.json())
    .then(resp => {
        document.getElementById('show-info').hidden = true
        document.getElementById('results').innerText = ''
        resp.forEach(buildResults)})
    .catch(err => console.log(err))
}

function buildResults(object){
    const results = document.getElementById('results')
    results.hidden = false
    let showName = document.createElement('p')
    showName.innerText = object.show.name
    showName.id = object.show.id
    showName.addEventListener('click', ()=>{
        results.hidden = true
        fetchShow(showName.id)})
    results.append(showName)
}

// from those results I should be able to select a show and get the number of episodes and seasons of that show and average runtime (click event)
function fetchShow(showID){
    fetch(`https://api.tvmaze.com/shows/${showID}?embed[]=episodes&embed[]=seasons`)
    .then(resp => resp.json())
    .then(buildShowInfo)
    .catch(err => console.log(err))
}

function buildShowInfo(showObject){
    document.getElementById('show-info').hidden = false
    document.getElementById('show-info').innerText = ''
    let showName = document.createElement('h2')
    let showImg = document.createElement('img')
    let description = document.createElement('p')
    description.innerHTML = showObject.summary
    showName.innerText = showObject.name
    showImg.src = showObject.image.medium
    const stats = showStats(showObject)
    document.getElementById('show-info').append(showName, showImg, description, buildShowNumbers(stats), divideWatch(stats))
    
}

function showStats(showObject){
    let showNums = {}
    showNums.numEps = showObject._embedded.episodes.length
    showNums.numSeas = showObject._embedded.seasons.length
    if (showObject.runtime === null){showNums.runtime = showObject.averageRuntime}
    else showNums.runtime = showObject.runtime;
    return showNums
}

function buildShowNumbers(showNums){
    let statDiv = document.createElement('div')
    let eps = document.createElement('p')
    let time = document.createElement('p')
    if (showNums.runtime === null){
        time.innerText = "Can't currently calculate total runtime for this show."
    }
    else{
        let totalWatchTime = (showNums.numEps * showNums.runtime)/60
        time.innerText = `Watching the show will take about ${Math.round(totalWatchTime)} hours.`
    }
    eps.innerText = `This show has ${showNums.numEps} episodes over ${showNums.numSeas} seasons.`
    statDiv.append(eps, time)
    return statDiv
}

// I should be able to choose how many episodes a night I want to watch and get a number of sittings to complete (input event)
function daysFromNow(numOfDays){
    let now = Date.now()
    let futureDate = new Date(now + (numOfDays * 86400000))
    return futureDate.toLocaleDateString()
}

function resultsText(totalEps, selectedValue, runtime){
    let numOfDays = Math.ceil(totalEps / selectedValue)
    if (selectedValue > totalEps){
        return "There aren't that many episodes!"
    }
    else if (selectedValue * runtime > 24 * 60){
        return "You can't watch that many episodes in one day"
    } 
    else {
        return `If you watch at pace of ${selectedValue} per day you'll finish the show in ${numOfDays} days. If you start now you'll finish on ${daysFromNow(numOfDays)}!`}

}

function divideWatch(showNums){
    let dayDiv = document.createElement('div')
    let numberSelect = document.createElement('input')
    numberSelect.type = 'number'
    numberSelect.value = 1
    dayDiv.innerText = 'How many episodes per day do you want to watch? '
    dayDiv.append(numberSelect)
    let results = document.createElement('p')
    results.innerText = resultsText(showNums.numEps, numberSelect.value, showNums.runtime)
    dayDiv.append(results)
    numberSelect.addEventListener('input', ()=>{
        results.innerHTML = resultsText(showNums.numEps, numberSelect.value, showNums.runtime)
    })
    return dayDiv
}