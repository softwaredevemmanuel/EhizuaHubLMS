import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Img from '../../../assets/student.png'
import ehz from '../../../assets/Ehizua.png'

const StudentDashboard = () => {
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [loginPupils, setLoginPupil] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        let login = JSON.parse(localStorage.getItem('Pupilslogin'));
        let Pupilslogin = login
        if (Pupilslogin && Pupilslogin.login && Pupilslogin.token && Pupilslogin.authHeader && Pupilslogin.school) {
            setLoginPupil(true);
            setPupil(Pupilslogin.user)
        }
    }, []);

 
    const handleSubmit = event => {
        event.preventDefault();
        login();
    };

    return (
        <div>
            {!loginPupils ? (
                <section className="w-full flex flex-col lg:flex-row h-screen">
                    <div className="w-[100%] lg:w-5/12 h-[30%] flex lg:flex-col lg:h-[100vh] bg-white items-center">
                        <div className=' flex flex-col mt-[-80px] ml-[135px] lg:m-0 justify-around lg:flex-row items-center  w-[300px] h-[20%]'>
                            <img src={ehz} alt="" />
                        </div>
                        <div className=" flex justify-center  w-[100%] h-[80%] bg-white rounded-full lg:rounded-none">
                            <img className="fixed left-[40%] top-[21%] w-[100px] h-[100px] lg:relative lg:left-0 lg:top-8 lg:w-[584px] lg:h-[450px] " src={Img} alt="" />
                        </div>
                    </div>
                    <div className="h-[70%]  w-[100%] lg:w-7/12 lg:h-[100vh] bg-[#134574] flex flex-col pt-[150px] lg:pt-[60px]">

                        <div className="relative top-[60px] right-[45%]  lg:relative lg:top-0 lg:right-0 h-[10%] text-[#134574] flex font-bold lg:text-white text-center justify-center align-middle items-center text-[15px] lg:text-[34px]">
                            STUDENT LOGIN
                        </div>

                        <div className="h-[60%] flex text-white text-xl  justify-around items-center">
                            <form 
                                onSubmit={handleSubmit}
                                className="flex flex-col justify-center items-center h-[100%] w-[70%] gap-8" 
                                id='form'>

                                <div className="flex flex-col w-[100%]">
                                <label>
                                    Username
                                    <input
                                        name='email'
                                        className="rounded-lg py-3 flex items-center text-black px-6"
                                        type="text"
                                        onChange={(event) => setEmail(event.target.value)}
                                        autoComplete="email" // Add the autocomplete attribute
                                    />
                                </label>


                                </div>
                                <div className="flex flex-col w-[100%]">
                                    <label>
                                        User ID
                                        <input
                                            id='id'
                                            className="rounded-lg py-3 flex items-center text-black px-6"
                                            type="password"
                                            placeholder="***********************"
                                            onChange={(event) => setId(event.target.value)}
                                        />
                                    </label>

                                </div>
                                <div className="flex justify-center items-center">
                                    <button
                                        className="text-[#134574] bg-white rounded-3xl py-[20px] px-[60px] font-bold"
                                        
                                    >
                                        LOGIN
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div>
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                        </div>
                        <a href="">Forgot Password</a>



                    </div>
                </section>
            ) : (
                <div>
                    <CourseSection />
                </div>
            )}

        </div>

    )
}

export default StudentDashboard;
