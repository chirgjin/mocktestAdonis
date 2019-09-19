module.exports = (len=5, type=5) => {

    const types = {
        'a' : 0,
        'A' : 1,
        'n' : 2,
        'N' : 2,
        '!' : 3,
        'aA' : 4,
        'aA1' : 5,
        'aAN' : 5,
        'aAn' : 5,
        'aAN!' : 6,
        'aAn!' : 6,
        'aA1!' : 6,
        'n!' : 7,
        'N!' : 7,
    }

    if(types.hasOwnProperty(type)) {
        type = types[type]
    }
    
    const clists = [
        'qwertyuiopasdfghjklzxcvbnm',
        'QWERTYUIOPASDFGHJKLZXCVBNM',
        '1234567890',
        '!@#$%^&*()_+-=',
        'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
        'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890',
        'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()_+-=',
        '1234567890!@#$%^&*()_+-=',
    ]

    const clist = clists[type] || clists[5]

    let str = ''

    while(str.length < len) {
        str += clist[Math.floor(Math.random() * clist.length)] || ''
    }

    return str;
}