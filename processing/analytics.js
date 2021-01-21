const fs = require('fs')
const csv = require('csv-parse')
const stringify = require('csv-stringify')
const parseDecimalNumber = require('parse-decimal-number');

const summaryCols = ['f220', 'f231', 'f332', 'f233', 'f234']

const DEPARTMENTS = {
    'ARE': {
        'name': 'Agricultural & Resource Economics',
        'category': 'HUMAN'
    },
    'BAE': {
        'name': 'Biological & Agricultural Engineering',
        'category': 'AG'
    },
    'PLS': {
        'name': 'Plant Sciences',
        'category': 'AG'
    },
    'PLB': {
        'name': 'Plant Biology',
        'category': 'BIO'
    },
    'PPA': {
        'name': 'Plant Pathology',
        'category': 'AG'
    },
    'ASC': {
        'name': 'Animal Science',
        'category': 'AG'
    },
    'HCE': {
        'name': 'Human Ecology',
        'category': 'HUMAN'
    },
    'TXC': {
        'name': 'Textiles & Clothing',
        'category': 'HUMAN'
    },
    'ESP': {
        'name': 'Environmental Science & Policy',
        'category': 'ENV'
    },
    'ENM': {
        'name': 'Entomology & Nematology',
        'category': 'AG'
    },
    'ETX': {
        'name': 'Environmental Toxicology',
        'category': 'ENV'
    },
    'LAW': {
        'name': 'Land, Air & Water Resources',
        'category': 'ENV'
    },
    'WFB': {
        'name': 'Wildlife, Fish & Conservation Biology',
        'category': 'ENV'
    },
    'VIT': {
        'name': 'Viticulture & Enology',
        'category': 'AG'
    },
    'FST': {
        'name': 'Food Science & Technology',
        'category': 'HUMAN'
    },
    'NTR': {
        'name': 'Nutrition',
        'category': 'HUMAN'
    },
    'MCB': {
        'name': 'Molecular & Cellular Biology',
        'category': 'BIO'
    },
    'EVE': {
        'name': 'Evolution & Ecology',
        'category': 'BIO'
    },
    'MIC': {
        'name': 'Microbiology & Molecular Genetics',
        'category': 'BIO'
    },
    'NPB': {
        'name': 'Neurobiology, Physiology & Behavior',
        'category': 'BIO'
    },
}

function errorHandler(error) { if(error) console.error(error) }

function accumProjectTotal(acc, record) {
    let total = parseDecimalNumber(record['f234'])
    const dept = record['dept']
    if(total > 0) {
        acc.push({
            project: record['project'],
            dept: dept,
            total: total
        })
    }
}

function accumDepartmentTotal(acc, record) {
    const dept = record['dept']

    for(k in record) {
        if(k.length === 4 && k[0] == 'f') {
            if(!acc[k]) {
                acc[k] = {}
            }
            if(!acc[k][dept]) {
                acc[k][dept] = 0
            }

            acc[k][dept] += parseDecimalNumber(record[k])
        }
    }
}

function groupDepartmentTotal(acc, record) {
    const dept = record['dept']

    for(k in record) {
        if(k.length === 4 && k[0] == 'f') {
            if(!acc[dept]) {
                acc[dept] = {}
            }
            if(!acc[dept][k]) {
                acc[dept][k] = 0
            }

            acc[dept][k] += parseDecimalNumber(record[k])
        }
    }
}

function generate(ad419_fp, projects_fp) {
    fs.mkdir('./output', (error) => {
        if(error && error.code !== 'EEXIST') {
            return errorHandler(error)
        }

        fs.writeFile('./output/departments.json', JSON.stringify(DEPARTMENTS), errorHandler)

        let projectTotals = []
        let departmentTotals = {}
        let grouped = {}
        let projects = {}
        let summaries = {}

        const writer = stringify({header: true})
        const ad419parser = csv({columns: true}), projectsparser = csv({columns: true, skip_lines_with_error: true})
        ad419parser.on('readable', () => {
            let record
            while (record = ad419parser.read()) {
                // add to department totals
                const dept = record['dept']

                if(dept !== 'IND' && dept !== 'XXX') {
                    accumProjectTotal(projectTotals, record)
                    accumDepartmentTotal(departmentTotals, record)
                }

                for(let col of summaryCols) {
                    if(!summaries[col]) {
                        summaries[col] = 0
                    }
                    summaries[col] += parseDecimalNumber(record[col])
                }

                groupDepartmentTotal(grouped, record)
            }
        })

        projectsparser.on('readable', () => {
            let record
            while (record = projectsparser.read()) {
                projects[record['ProjectNumber1']] = {
                    'OrgR': record['OrgR'],
                    'AccessionNumber': record['AnrAccessionNumber'],
                    'Title': record['Title'],
                    'ProjectDirector': record['ProjectDirector'],
                    'CoProjectDirectors': record['CoProjectDirectors'],
                    'ProjectStartDate': record['ProjectStartDate'],
                    'ProjectEndDate': record['ProjectEndDate']
                }
            }
        })

        projectsparser.on('end', () => {
           fs.writeFile('./output/projects.json', JSON.stringify(projects), errorHandler)
        })

        ad419parser.on('end', () => {
            fs.writeFile('./output/projectTotals.json', JSON.stringify(projectTotals), errorHandler)
            fs.writeFile('./output/departmentTotals.json', JSON.stringify(departmentTotals), errorHandler)

            for(let dept in grouped) {
                writer.write({
                    'dept': dept, 
                    ...grouped[dept],
                })
            }

            summaries['f233nostate'] = summaries['f233'] - summaries['f220']
            let data = {
                'nodes': [
                    {'name': 'State 220'},
                    {'name': 'State Funds'},
                    {'name': 'f231'},
                    {'name': 'f332'},
                    {'name': 'f233'},
                    {'name': 'Total Research f234'},
                ],
                'links': [
                    { 'source': 0, 'target': 1, 'value': summaries['f220'] },
                    { 'source': 1, 'target': 5, 'value': summaries['f220'] },
                    { 'source': 2, 'target': 5, 'value': summaries['f231'] },
                    { 'source': 3, 'target': 5, 'value': summaries['f332'] },
                    { 'source': 4, 'target': 5, 'value': summaries['f233nostate'] },
                ]
            }

            let deptIndex = 6
            for(let [k, v] of Object.entries(grouped)) {
                data.links.push({ 'source': 5, 'target': deptIndex, 'value': v.f234 })
                data.nodes.push({ 'name': k })
                deptIndex += 1
            }

            fs.writeFile('./output/sankey.json', JSON.stringify(data), errorHandler)
                
        })

        fs.createReadStream(ad419_fp).pipe(ad419parser)
        fs.createReadStream(projects_fp).pipe(projectsparser)
        const grouped_csv = fs.createWriteStream('./output/caesgrouped.csv')
        writer.pipe(grouped_csv)
    })
}

if(process.argv.length == 4) {
    generate(process.argv[2], process.argv[3])
} else {
    console.error("usage: node analytics.js <ad419.csv> <projects.csv>")
}