"use client"
import {Drum, Search, Clapperboard, Upload} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

const NavBar = () =>{

    const [admin, setAdmin] = useState(true) //change later

    const router = useRouter();

    const home = () => {
        router.push('/') 
    }

    const search = () => {
        router.push('/search')
    }

    const upl = () => {
        router.push('/upload')
    }

     return (
        <div className="flex w-full text-white justify-between">
            <button onClick={home} className="flex">
                <Drum size={24} color="white"/>
                <h1 className="px-1">
                    MediaViewer
                </h1>
            </button>
            <div className = "flex gap-4">
                <button onClick={search}>
                    <Search size={24} color="white"/>
                </button>
                {admin && ( <>
                <button>
                    <Clapperboard size={24} color="white"/>
                </button>
                <button onClick={upl}>
                    <Upload size={24} color="white"/>
                </button>
                </>)
                }
            </div>
        </div>

    )
}


export default NavBar;