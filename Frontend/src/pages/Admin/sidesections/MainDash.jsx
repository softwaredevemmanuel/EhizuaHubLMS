import und from '../../../../assets/undraw.png'
import vector7 from '../../../../assets/Vector (5).png'
import vector3 from '../../../../assets/Vector (2).png'
import vector4 from '../../../../assets/Vector (3).png'
import party from '../../../../assets/party.png'
const MainDash = () => {
  return (
    <div className='overflow-auto h-[100%]'>
      <div className="grid grid-col-1 gap-3">
        <p className="text-[20px] lg:text-[40px] font-bold text-white border-b-red-500 border-b pb-3">
          <p>
          Welcome Admin
         </p>
         <p className="text-[10px] lg:text-[20px]">
          Streamlining Management, One Click at a Time
         </p>
        </p>

        <section className="grid grid-cols-2  gap-6 ">
            <div className="row-span-2 col-span-2 lg:p-4 rounded-lg bg-[#486D8E] grid grid-cols-1 lg:grid-cols-2">

                <div className='p-[2rem] lg:p-[6rem] grid grid-cols-1 lg:gap-1'>
                    <p className='text-white font-bold  text-[15px] lg:h-[180px] xl:h-[100px]  lg:text-[30px]'>Elevate Your Learning with Every Click</p>
                    <button className='bg-white rounded-lg px-1 text-xs h-[50px] w-[100px] lg:p-0 text-pink-600 lg:w-[50%] lg:h-[70px]'>Create Memo</button>
                </div>

                <img className='object-cover w-full' src={und} alt="" />
            </div>

            <div className="rounded-xl bg-[#486D8E] grid grid-cols-2 items-center p-6 h-[100px] lg:h-[180px]">
               <img className='h-full object-cover' src={vector7} alt="" />
               <div className='grid grid-cols-1  text-white font-bold text-[10px] lg:text-[30px]'>
                  <p>Leave Request</p>
                  <p>5</p>
               </div>
            </div>
            <div className="rounded-xl bg-[#486D8E] grid grid-cols-2 items-center h-[100px] p-6 lg:h-[180px]">
               <img className='h-full object-cover' src={vector3} alt="" />
               <div className='grid grid-cols-1  text-white font-bold text-[10px] lg:text-[30px]'>
                  <p>Number of staff</p>
                  <p>10</p>
               </div>
            </div>
            <div className="rounded-xl bg-[#486D8E] grid grid-cols-2 items-center h-[100px] p-6 lg:h-[180px]">
               <img className='h-full object-cover' src={vector4} alt="" />
               <div className='grid grid-cols-1  text-white font-bold text-[10px] lg:text-[30px]'>
                  <p>Number of students</p>
                  <p>67</p>
               </div>
            </div>
            <div className="rounded-xl bg-[#486D8E] grid grid-cols-2 items-center h-[100px] p-6 lg:h-[180px]">
               <img className='h-full object-cover' src={party} alt="" />
               <div className='grid grid-cols-1  text-white font-bold text-[10px] lg:text-[30px]'>
                  <p>Birthday Celebration</p>
                  <p>10</p>
               </div>
            </div>

            
        </section>
      </div>
    </div>
  );
};

export default MainDash;
