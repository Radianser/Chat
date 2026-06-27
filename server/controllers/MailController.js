import path from 'path';
import fs from 'fs';
import User from '#models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Создаём объект "транспортера" — он отвечает за соединение с почтовым сервером
const transporter = nodemailer.createTransport({
    host: process.env.APP_MAIL_HOST,
    port: process.env.APP_MAIL_PORT,
    secure: true, // true для 465 порта, false для остальных
    auth: {
        user: process.env.APP_MAIL_USER,
        pass: process.env.APP_MAIL_PASSWORD,
    },
});

export default class MailController {
    constructor() { }

    send(subject, email, url) {
        let template_name = `get_${subject}_template`;
        let html = this[template_name](url);
        let subject_title = '';

        switch (subject) {
            case 'registration':
                subject_title = 'Регистрация в приложении Chat';
            break;
            case 'password_restore':
                subject_title = 'Сброс пароля в приложении Chat';
            break;
            default:
                subject_title = 'Новое действие в приложении Chat';
            break;
        }

        this.send_email(email, subject_title, '', html);
    }

    async send_email(to, subject, text, html) {
        try {
            const info = await transporter.sendMail({
                from: process.env.APP_MAIL_USER, // адрес и имя отправителя
                to: to, // адрес получателя
                subject: subject, // тема письма
                text: text, // текстовая версия (можно отправить просто текст)
                html: html, // HTML-версия
            });

            console.log('Письмо отправлено:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Ошибка при отправке письма:', error);
            return { success: false, error: error.message };
        }
    }

    get_registration_template(url) {
        return `<div style='background-color:#edf2f7;'>
            <div style='font-size:16px;box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);'>
                <div style='text-align:center;padding:20px 0;'>
                    <a href='${process.env.APP_DOMAIN}' style='font-weight:bold;font-size:22px;color:#2d3748;text-decoration:none;'>${process.env.APP_NAME}</a>
                </div>
                <div style='width:55%;margin: 0 auto;background-color:#ffffff;padding:40px;border-radius:10px;'>
                    <div style='font-weight:bold;margin-bottom:20px;color:#2d3748;'>
                        Привет!
                    </div>
                    <div style='margin-bottom:40px;'>
                        Пожалуйста, нажмите кнопку ниже, чтобы подтвердить свой адрес электронной почты.
                    </div>
                    <div style='text-align:center;margin-bottom:40px;'>
                        <a href='${url}' style='display:inline-block;background-color:#2d3748;padding:10px 15px;border-radius:10px;color:white;text-decoration:none;'>
                            Подтвердить email
                        </a>
                    </div>
                    <div style='margin-bottom:20px;'>
                        Если вы не создавали учетную запись, никаких дальнейших действий не требуется.
                    </div>
                    <div>С уважением,</div>
                    <div>
                        ${process.env.APP_NAME}
                    </div>
                    <hr style='margin:20px 0;'>
                    <span style='font-size:14px;'>
                        Если у Вас возникли проблемы с нажатием кнопки 'Подтвердить email', скопируйте и вставьте приведенный ниже URL-адрес в свой браузер: 
                        <a href='${url}' style='word-break:break-all;'>${url}</a>
                    </span>
                </div>
                <div style='font-size:12px;text-align:center;padding:40px;'>
                    © ${(new Date).getFullYear()} ${process.env.APP_NAME}. Все права защищены.
                </div>
            </div>
        </div>`;
    }

    get_password_restore_template(url) {
        return `<div style='background-color:#edf2f7;'>
            <div style='font-size:16px;box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);'>
                <div style='text-align:center;padding:20px 0;'>
                    <a href='${process.env.APP_DOMAIN}' style='font-weight:bold;font-size:22px;color:#2d3748;text-decoration:none;'>${process.env.APP_NAME}</a>
                </div>
                <div style='width:55%;margin: 0 auto;background-color:#ffffff;padding:40px;border-radius:10px;'>
                    <div style='font-weight:bold;margin-bottom:20px;color:#2d3748;'>
                        Привет!
                    </div>
                    <div style='margin-bottom:40px;'>
                        Вы получили это письмо, потому что мы получили запрос на сброс пароля для Вашей учётной записи.
                    </div>
                    <div style='text-align:center;margin-bottom:40px;'>
                        <a href='${url}' style='display:inline-block;background-color:#2d3748;padding:10px 15px;border-radius:10px;color:white;text-decoration:none;'>
                            Сбросить пароль
                        </a>
                    </div>
                    <div style='margin-bottom:20px;'>
                        Срок действия ссылки для сброса пароля истекает через 15 минут.
                    </div>
                    <div style='margin-bottom:20px;'>
                        Если Вы не запрашивали восстановление пароля, никаких дополнительных действий не требуется.
                    </div>
                    <div>С уважением,</div>
                    <div>
                        ${process.env.APP_NAME}
                    </div>
                    <hr style='margin:20px 0;'>
                    <span style='font-size:14px;'>
                        Если у Вас возникли проблемы с нажатием кнопки 'Сбросить пароль', скопируйте и вставьте приведенный ниже URL-адрес в свой браузер: 
                        <a href='${url}' style='word-break:break-all;'>${url}</a>
                    </span>
                </div>
                <div style='font-size:12px;text-align:center;padding:40px;'>
                    © ${(new Date).getFullYear()} ${process.env.APP_NAME}. Все права защищены.
                </div>
            </div>
        </div>`;
    }
}