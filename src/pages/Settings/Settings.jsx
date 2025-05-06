import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const Settings = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 gap-6 h-[calc(100vh-64px-40px)]">
      <div className="justify-center items-center"> 
        <Cog6ToothIcon className="w-80 h-80 text-blue-700" />
        <h1 className="text-2xl text-center font-bold text-blue-900">Configurações</h1>
        <p className="text-gray-600 text-center">
          Personalize sua experiência.
        </p>
      </div>
      

    </div>
  );
};

export default Settings;


  