const fs = require('fs')
const path = require('path')
const _ = require('lodash')


let all = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/static/data/naicsKeys.json')))

let industries = _.pickBy(all, (v,k) => (k && (k.split('-')[0].length === 2)))

let industryTitles = _.mapValues(industries, o => o.title)

console.log(JSON.stringify(industryTitles, null, 2))
