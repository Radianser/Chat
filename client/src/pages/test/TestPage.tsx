import '@src/main.css'
import { Link } from 'react-router-dom'

function TestPage() {
    return (
        <>
            <div>
                <ul className=''>
                    <li>
                        <Link to={'/'}>Main</Link>
                    </li>
                    <li>
                        <Link to={'/test'}>About</Link>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default TestPage