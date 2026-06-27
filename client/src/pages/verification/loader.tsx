// import { useUserStore } from '@src/stores/user/userStore';
// import { redirect } from 'react-router-dom';
// import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

export async function loader({ params }: LoaderFunctionArgs) {
    return { id: params.id, token: params.token };
}

// export async function action({ request, params }: ActionFunctionArgs) {
//     const formData = await request.formData();
//     const updates = Object.fromEntries(formData);
//     // const updateTask = useUserStore((store) => store.updateTask);
//     // Чистый вызов без хуков
//     const { updateTask } = useUserStore.getState();

//     await updateTask({...params, ...updates});
//     return redirect(`/list`);
// }