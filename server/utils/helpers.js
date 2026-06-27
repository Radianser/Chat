import path from 'path';
import fs from 'fs';

export const helpers = {
    // Хелпер для сравнения
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    gte: (a, b) => a >= b,
    lte: (a, b) => a <= b,
    boolean: (a) => Boolean(a),
    
    // Хелпер для проверки чётности индекса
    even: (index) => index % 2 === 0,
    
    // Хелпер для работы с массивами
    contains: (array, value) => array && array.includes(value),

    getTime: () => {
        let date = new Date();
        let hours  = date.getHours();
        let minutes = date.getMinutes();
        let seconds   = date.getSeconds();
        return helpers.reverseStr(`${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
    },
    sum: (num1, num2) => {
        return num1 + num2;
    },
    upperFirst: (str) => {
        return str[0].toUpperCase() + str.slice(1);
    },
    reverseStr: (str) => {
        return str.split(':').reverse().join(':');
    },
    getProductView: (product) => {
        return product.name + ' - ' + product.cost;
    },
    createLink: function(href, ancor) {
		return '<a href="'+ href +'" target="__blank" rel="noopener noreferrer">' + ancor + '</a>';
	},
    writeToFile: async (data) => {
        const logMessage = JSON.stringify(data) + '\n\n';
        const logPath = path.join(process.cwd(), 'logs/server.log');

        try {
            console.log('Writing to file... ', data);
            await fs.promises.appendFile(logPath, logMessage);
        } catch (error) {
            console.error(error);
        }
    }
}