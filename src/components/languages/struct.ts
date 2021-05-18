type LanguageStruct = {
    language: string;
    text: {
        weekDays: string[];
        months: string[];
        weekDaysShort: {
            monday: string;
            tuesday: string;
            wednesday: string;
            thursday: string;
            friday: string;
            saturday: string;
            sunday: string;
        };
        notificationPanel: {
            noNewNotification: string;
            location: string;
            nightLight: string;
            screenSnip: string;
            network: string;
        };
    };
};

export default LanguageStruct;
