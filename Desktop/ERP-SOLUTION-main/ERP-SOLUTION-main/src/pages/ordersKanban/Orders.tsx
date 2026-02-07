
import DragAndDrop from "@/pages/ordersKanban/DragAndDrop";

export default function Orders() {
  return (
    <div className="glav-font ">
        <div>
         <h2 className='text-3xl text-[#1d1f21] font-bold mt-4 mb-8'> Orders Kanban Board</h2> 
         <div className='w-full   shadow-md
   rounded-lg max-w-auto h-[56px] bg-[#028BBF] backdrop-blur-md flex gap-2 items-center justify-start pl-4'>
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-shield-alert-icon text-[#FF5E22]  lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> 
         <p className='text-[#1d1f21] '>Failed to load some orders. Please refresh or try again later.</p></div>
        </div>
        <div className='flex gap-4 '>  
        <div className='mt-6 '>
         </div>
                </div>
         <div className="mt-6 flex gap-4 px-4  rounded-[13px]
  shadow-[1px_1px_2px_1px_gray]
  bg-white
  backdrop-blur-[10px]
  p-[0.55rem]
  pr-12
  text-base
  max-w-full h-[800px]
  transition-[border] text-[#5b656f]">
    
    <div className="max-w-full min-h-[600px] rounded-md my-3 mx-2">
       <DragAndDrop />

    </div> 
         </div>
         
         
</div>
  )
} 