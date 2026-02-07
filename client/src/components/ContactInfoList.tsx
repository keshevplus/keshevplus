import React from 'react';
import { Phone } from 'lucide-react';

interface ContactInfo {
  id: string;
  type: string;
  value: string;
  label: Record<string, string>;
}

interface ContactInfoListProps {
  contactInfo: ContactInfo[] | null;
  language: string;
  iconMap: Record<string, React.FC<{ className?: string }>>;
}

const ContactInfoList: React.FC<ContactInfoListProps> = ({ contactInfo, language, iconMap }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-primary mb-4">
        {language === 'he' ? 'דרכי התקשרות' : 'Get in Touch'}
      </h3>
      <div className="flex flex-col gap-6">
        {contactInfo?.map((info) => {
          const IconComponent = iconMap[info.type] || Phone;
          return (
            <div key={info.id} className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                <IconComponent className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-base text-muted-foreground mb-1">
                  {info.label[language]}
                </h4>
                {info.type === 'phone' ? (
                  <a 
                    href={`tel:${info.value.replace(/-/g, '')}`}
                    className="font-bold text-primary hover:text-primary/80 transition-colors block text-xl"
                    dir="ltr"
                  >
                    {info.value}
                  </a>
                ) : info.type === 'email' ? (
                  <a 
                    href={`mailto:${info.value}`}
                    className="font-bold text-primary hover:text-primary/80 transition-colors block break-all text-xl"
                    dir="ltr"
                  >
                    {info.value}
                  </a>
                ) : info.type === 'address' ? (
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(info.value)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground hover:text-primary transition-colors block text-xl leading-snug"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="font-bold text-foreground text-xl">
                    {info.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactInfoList;
