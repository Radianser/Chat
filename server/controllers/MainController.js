import path from 'path';
import fs from 'fs';
import User from '#models/User.js';
import { helpers } from '#utils/helpers.js';

export default class MainController {
    #number = 5;

    constructor() {}

    async index(request, response) {
        console.log('cookies: ', request.cookies); // get
        console.log('session: ', request.session.test2); // get

        // const user = process.env.DB_USER;
        // console.log('user: ', user);

        const modelUser = new User();
        // let users = await modelUser.getAllUsers();
        // console.table(users);
        // console.table(process.cwd());

        // let result = await modelUser.getUsers();
        // console.table(result);

        let users = await modelUser.getUsersTest();
        console.table(users);

        response.status(200).render('3', {});
    }

    indexPost(request, response) {
        // console.log('req.body: ', request.body);
        // response.status(200).render('3', { ...request.body }); // вернет целую страницу (данные формы будут подставлены)

        response.status(200).type('application/json').send({ ...request.body });
    }

    async getPage(request, response) {
        console.log('test1:', Number(request.query.test1));
        console.log('test2:', request.query.test2);
        
        const sum = Number(request.query.test1) + Number(request.query.test2) + this.#number; // чтобы работало используем .bind() при регистрации роутов
        
        try {
            const viewPath = path.join(process.cwd(), 'views', `${request.params.page}.hbs`);
            await fs.promises.access(viewPath);

            response.render(request.params.page, {
                img: '/img/2.jpg',
                name: 'RadianserGames', 
                href: 'https://www.twitch.tv/radiansergames',
                text: '<b>text</b>',
                html: '<b>html</b>',
                title: 'my site',
                description: 'my discription',
                user: {name: 'sam', age: 30},
                users: ['user1', 'user2', 'user3'],
                sum: sum.toString(), // совпадает с именем хэлпера, из-за чего в шаблоне вызывается хэлпер, а не переменная
                sumNumber: sum,
                test1: response.query.test1,
                test2: response.query.test2
            });
        } catch (error) {
            console.error(error);
            response.status(404).send('file not found');
        }
    }

    formTarget(request, response) {
        console.log(request.body);

        response.status(200).type('application/json').send('result');
    }

    test(request, response) {
        // response.clearCookie('test'); // clear
        if(!Object.keys(request.cookies).length) {
            response.cookie('test', '1', {
                // domain: 'site.com',
                path: '/test/',
                maxAge: 1000 * 60 * 60,
                secure: true,
                httpOnly: true,
            }); // set
        }
        console.log('cookies: ', request.cookies); // get


        console.log('session: ', request.session.test2); // get
        delete request.session.test2;
        request.session.test2 = 'abcde';

        response.status(200).render('3', {});
    }

    async actionApi(request, response) {
        helpers.writeToFile(request.body);

        response.status(200).type('application/json').send({
            result: 'success'
        });
    }
}