// пример
// loader - если в адресе есть какие-то параметры и надо что-то с ними сделать перед рендером страницы
// action - стандартная обработка отправки формы

import { useUserStore } from '@src/stores/user/userStore';
import { redirect } from 'react-router-dom';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router-dom';

export async function loader({ params }: LoaderFunctionArgs) {
    // const getTask = useUserStore((store) => store.getTask);
    const { getTask } = useUserStore.getState();

    if (!params.id) {
        throw new Response("ID не указан", { status: 400 });
    }
    const taskId = Number(params.id);
    if (isNaN(taskId)) {
        throw new Response("Некорректный формат ID", { status: 400 });
    }

    const task = await getTask(taskId);
    return { task };
}
export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    // const updateTask = useUserStore((store) => store.updateTask);
    // Чистый вызов без хуков
    const { updateTask } = useUserStore.getState();

    await updateTask({...params, ...updates});
    return redirect(`/list`);
}