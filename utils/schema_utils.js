

function clean_string_spaces(value){
    value = value.replace(/^\s+/, '')
    value = value.replace(/\s+$/, '')
    value = value.replace(/\s+{2, }/, ' ')
    value = value.replace(/(\s+)?\/(\s+)?/, '/')
    value = value.toLowerCase()
    return value
}

function searchInputHandler(value, schema, years){
    value = clean_string_spaces(value)
    let result = []
    let splitted = value.split(/\//)
    if (splitted.length == 0 || splitted.length > 2 || value == '') return result
    if (splitted.length == 1 || value[value.length - 1] == '/'){
        let word = splitted[0]
        let matchedSpecialities = findSpeciality(word, schema, years)
        result = result.concat(matchedSpecialities)
        let justSpecialitiesMatched = matchedSpecialities.map(x => x['speciality'])
        for (let speciality of justSpecialitiesMatched) {
            for (let theme of Object.keys(schema[speciality])) {
                let qCounter = getQuestionCounter(speciality, theme, schema, years)
                result = result.concat({'speciality': speciality, 'theme': theme, 'counter': qCounter})
            }
        }
        for (let speciality of Object.keys(schema)){
            let matchedThemes = findTheme(word, speciality, schema, years)
            result = result.concat(matchedThemes)
        }
    }
    else if (splitted.length == 2){
        let [speciality_str, theme_str] = splitted
        let matchedSpecialities = findSpeciality(speciality_str, schema, years)
        let justSpecialitiesMatched = matchedSpecialities.map(x => x['speciality'])
        for (let speciality of justSpecialitiesMatched){
            let matchedThemes = findTheme(theme_str, speciality, schema, years)
            result = result.concat(matchedThemes)
        }
    }
    return result
}

function findSpeciality(value, schema, years) {
    let result = []
    for (let speciality of Object.keys(schema)) {
        if (speciality.includes(value)){
            let qCounter = getQuestionCounter(speciality, false, schema, years)
            result.push({'speciality': speciality, 'counter': qCounter})
        }
    }
    return result
}

function findTheme(value, speciality, schema, years){
    let result = []
    for (let theme of Object.keys(schema[speciality])) {
        if (theme.includes(value)) {
            let qCounter = getQuestionCounter(speciality, theme, schema, years)
            result.push({'speciality': speciality, 'theme': theme, 'counter': qCounter})
        }
        else if(schema[speciality][theme].hasOwnProperty('analogos')){
            for (let analogo of schema[speciality][theme]["analogos"]){
                if (analogo.includes(value)) {
                    let qCounter = getQuestionCounter(speciality, theme, schema, years)
                    result.push({'speciality': speciality, 'theme': theme, 'analogo': analogo, 'counter': qCounter});
                    break;
                }
            }
        } 
    }
    return result
}

function getQuestionCounter(speciality, theme, schema, years) {
    let result = []
    if (!theme) {
        for (theme of Object.keys(schema[speciality])){
            let filtered = schema[speciality][theme]['array'].filter(q => years.includes(q['origin']['exam']))
            result = result.concat(filtered)
        }
    } else result = schema[speciality][theme]['array'].filter(q=> years.includes(q['origin']['exam'])) 
    return result.length
}


// Parsear el value del searcher y verificar si existe el path en el schema
function confirmIfPathExists(value, schema) {
    value = clean_string_spaces(value)
    let splitted = value.split(/\//)
    if (splitted.length == 0 || splitted.length > 2 || value == '') return false
    if (splitted.length == 1 || value[value.length - 1] == '/') {
        value = splitted[0].replace('/', '')
        if (Object.keys(schema).includes(value)) return value
        else return false
    }
    else if (splitted.length == 2){
        let [sp, th] = splitted
        if (Object.keys(schema).includes(sp)) {
            if (Object.keys(schema[sp]).includes(th)) return `${sp}/${th}`
            else return false
        } else return false
    }
}

export default {
    searchInputHandler,
    confirmIfPathExists
}