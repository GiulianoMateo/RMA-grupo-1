
import NotificationItem from "../atoms/NotificationItem";
import { LoadingDots } from "../atoms";

function NotificationList({ showNotis, notificaciones, loadingNotifications }) {
  
  console.log("notificaciones es:", notificaciones, "tipo:", typeof notificaciones);


  return (
      <div
        className={`absolute drop-shadow-lg top-14 right-0 z-40 mx-auto flex w-full flex-col justify-center px-2 pt-0 transition-all duration-300 ease-in-out transform ${
          showNotis ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        } md:h-[unset] w-[320px] md:w-[520px] lg:px-6 xl:pl-0 rounded-lg`}
      >
        <div className="relative flex bg-opacity-0 w-full normal-bg flex-col pt-[20px] md:pt-0 rounded-lg">
          <div className="border bg-card text-card-foreground shadow-sm mr-0 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800 md:mb-0 rounded-lg">
            <div className="mb-2">
              <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-lg">
                
              </p>
            </div>

            {loadingNotifications ? <LoadingDots /> : notificaciones.map((noti) => <NotificationItem key={noti.id} data={noti} />)}
          </div>
        </div>
      </div>
  );
}

export default NotificationList;
