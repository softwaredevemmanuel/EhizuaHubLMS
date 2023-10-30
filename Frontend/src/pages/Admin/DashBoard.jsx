import { Link } from 'react-router-dom'
import Img from '../../../assets/Ehizua.png'
import { useState } from 'react';
import vector1 from '../../../assets/Vector.png'
import vector2 from '../../../assets/Vector (1).png'
import vector3 from '../../../assets/Vector (2).png'
import vector4 from '../../../assets/Vector (3).png'
import vector5 from '../../../assets/Group 85.png'
import vector6 from '../../../assets/Vector (4).png'
import vector7 from '../../../assets/Vector (5).png'
import vector8 from '../../../assets/Vector (6).png'
import InstructorDetails from './sidesections/InstructorDetails';
import MainDash from './sidesections/MainDash';



const DashBoard = () => {
// const[course,setCourse] = useState('Full stack web development')
// const[leave,setLeave]  = useState(null) 
const[open,setOpen] = useState(false) 

//   const options = [
//     {list: 'Select Course' },
//     {list: 'Full stack web development'},
//     {list: 'Python' },
//     {list: 'Cyber Security'},
//     {list:'Cinematography'}
//   ]
//   const sickLeave = [
//     {list: 1 },
//     {list: 2},
//     {list: 3 },
//     {list: 4},
//     {list:5},
//     {list:6},
//     {list:7},
//     {list:8},
//     {list:9},
//     {list:10},
//   ]
//   const change = (event)=>{
//      setCourse(event.target.value)
//   }
//   const changeLeave = ()=>{
//     setLeave(leave)
//   }

  return (
    <div className="flex h-screen">
    <div className="flex flex-col  w-[30%] bg-[#134574] gap-10 p-10"> 

       <div className='bg-white p-3 rounded-lg'>
          <img  src={Img} alt="" />
       </div>




       <div className="flex gap-3 flex-col text-white justify-center items-center  lg:items-start">
       <Link className="flex items-center  gap-3">
            <img src={vector1} alt="" />
            <p className="hidden lg:block">
             COURSE CURRICULLUM
            </p>
          </Link> 
          <Link onClick={()=>setOpen(!open)} className="flex flex-col items-center gap-3 duration-100">
            <div className="flex items-center gap-3">
            <img src={vector2} alt="" />
                <p className='hidden lg:block'>
                INSTRUCTOR SECTION
                </p>
            </div>
              <div className={open?"bg-white text-[5px] sm:text-[10px] lg:text-[15px] duration-100  text-black flex flex-col p-4 rounded-lg":"hidden" }>
                 <Link>View instructor details</Link>
                 <Link>Hub instructor</Link>
                 <Link>School instructor</Link>
              </div>
          </Link>
          <Link className="flex items-center gap-3">
            <img src={vector3} alt="" />
            <p className="hidden lg:block">
             STAFF SECTION
            </p>
          </Link>
          <Link className="flex  items-center gap-3">
            <img src={vector4} alt="" />
             <p className='hidden lg:block'>
               STUDENTS SECTION
             </p>
          </Link>
          <Link className="flex items-center gap-3">
            <img src={vector5} alt="" />
            <p className="hidden lg:block">
              PARTNER SCHOOLS
            </p>
          </Link>
          <Link className="flex items-center gap-3">
            <img src={vector6} alt="" />
            <p className="hidden lg:block">
             PATNER SCHOOLS STUDENTS
            </p>
          </Link>
          <Link className="flex items-center gap-3">
            <img src={vector7} alt="" />
            <p className="hidden lg:block">
             LEAVE SECTION
            </p>
          </Link>
          <Link className="flex items-center gap-3">
            <img src={vector8} alt="" />
            <p className="hidden lg:block">
             AREA OFFICES
            </p>
          </Link>
       </div> 
    </div>


    {/* side section */}
    <div className='bg-[#B3BCC5] w-[100%] h-screen p-9'> 
        {/* <InstructorDetails/> */}
        <MainDash/>
    </div>
  </div>
  

















//    <section className="w-full h-screen flex">
//     <section className="w-3/12 bg-[#134574] h-[100%] flex flex-col gap-12 items-center py-8 justify-between">
//        <div className='h-[10%]'>
//         <div className='bg-white w-[200px] py-6 px-6 rounded-lg '>
//         <img src={Img} alt="" />
//         </div>
//         </div>


//       <div className='flex flex-col gap-6 text-white font-bold text-[23px] h-[80%]'>
//        <div className="flex items-center gap-4">
//         <BsFillPersonFill color='#F4415E'/>
//         TUTOR SECTION
//         <AiFillCaretDown color='#F4415E'/>
//        </div>
//        <div className="flex items-center gap-4">
//         <BsPersonFillCheck color='#F4415E'/>
//         STAFF SECTION
//        </div>
//        <div className="flex items-center gap-4">
//         <BsFillJournalBookmarkFill color='#F4415E'/>
//         STUDENTS SECTION
//        </div>
//        <div className="flex items-center gap-4">
//         <BsFillFileEarmarkZipFill  color='#F4415E'/>
//         PATNERS SECTION
//        </div>
//        <div className="flex items-center gap-4">
//        <AiOutlineNodeCollapse  color='#F4415E'/>
//         PATNERS SCHOOLS STUDENTS
//        </div>
//        <div className="flex items-center gap-4">
//        <AiOutlineSetting color='#F4415E'/>
//         SETTINGS
//        </div>
//        </div>

//        <Link className='flex items-center  text-white font-bold text-[23px] h-[10%] gap-4'>
//         <BiLogOut  color='#F4415E'/>
//          Logout
//        </Link>
//     </section>









//     <section className="w-9/12  flex flex-col mx-2 gap-2">
//          <div className="flex w-full justify-between items-center text-center h-[10%] border-b border-blue-500 ">
//             <p className='text-[#134574] text-3xl font-bold flex items-center text-center justify-center align-middle '>ADMIN DASHBOARD</p>
//          </div>


//          <div className="bg-[#134574] h-[100%] flex flex-col items-center">
//             <div className="text-white text-center text-3xl py-5">
//               Tutor Dashboard
//             </div>
//              <form className='flex flex-col gap-6'>
//                 <div className="flex items-center">
//                     <label htmlFor="firstname"  className='flex items-center w-[200px] text-white'>First Name</label>
//                     <input type="text" className='w-[400px]  py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="lastname"  className='flex items-center w-[200px] text-white'>Last Name</label>
//                     <input type="text" className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="email"  className='flex items-center w-[200px] text-white'>Email</label>
//                     <input type="email" className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="phonenum"  className='flex items-center w-[200px] text-white'>Phone Number</label>
//                     <input type="number" className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="phonenum" className='flex items-center w-[200px] text-white'>Date of Birth</label>
//                     <input type="date" className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="sickleave"  className='flex items-center w-[200px] text-white'>Allocate Sick Leave</label>
//                     <select className='bg-white rounded py-4 w-[100px]' onChange={changeLeave}>
//                             {
//                                 sickLeave.map((item,id)=>
//                                     (
//                                         <option key={id}>{item.list}</option>
                        
//                                     )
//                                 )
//                             }
//                           </select>
//                 </div>


//                 <div className="flex items-center">
//                     <label htmlFor="sickleave"  className='flex items-center w-[200px] text-white'>Account Details</label>
//                     <input type="" className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="sickleave"  className='flex items-center w-[200px] text-white'>Next of Kin Name</label>
//                     <input type="text" className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="sickleave"  className='flex items-center w-[200px] text-white'>Next of Kin phone Number</label>
//                     <input type='number' className='w-[400px] py-1 px-6' />
//                 </div>
//                 <div className="flex items-center">
//                     <label htmlFor="sickleave"  className='flex items-center w-[200px] text-white'>Home Address</label>
//                     <input type="text" className='w-[400px] py-1 px-6' />
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <div className="flex items-center" >
//                           <select className='bg-white rounded py-4 w-[200px]' onChange={change}>
//                             {
//                                 options.map((item,id)=>
//                                     (
//                                         <option key={id}>{item.list}</option>
                        
//                                     )
//                                 )
//                             }
//                           </select>
//                     </div>
//                     <input placeholder={course} className='bg-white w-[400px] rounded py-4 px-6'/>
//                 </div>


//                 <div className="flex items-center justify-between">
//                     <div  className='flex items-center w-[200px]'> 
//                     </div>

//                     <div className='flex w-[400px] justify-between'>
//                      <div></div>   
//                     <Link  style={{background: 'linear-gradient(180deg, #FF7A00 0%, #EF2689 100%', color: 'white', padding:'10px 20px', borderRadius: '4px' }}>Submit</Link>        
//                     </div>

//                 </div>             
//              </form>

//          </div>




//     </section>

//    </section>
  )
}

export default DashBoard
