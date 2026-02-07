import { motion } from 'framer-motion';
import { FileText, Users, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';

const QuestionnairesSection = () => {
  const { t, isRTL } = useLanguage();

  const questionnaires = [
    {
      icon: Users,
      title: t('questionnaires.parent_form'),
      description: t('questionnaires.parent_form_desc'),
      id: 'parent-form',
      pdf: '/docs/vanderbilt_parent_form.pdf',
      docx: '/docs/vanderbilt_parent_form.docx',
    },
    {
      icon: FileText,
      title: t('questionnaires.teacher_form'),
      description: t('questionnaires.teacher_form_desc'),
      id: 'teacher-form',
      pdf: '/docs/vanderbilt_teacher_form.pdf',
      docx: '/docs/vanderbilt_teacher_form.docx',
    },
    {
      icon: User,
      title: t('questionnaires.self_report'),
      description: t('questionnaires.self_report_desc'),
      id: 'self-report',
      pdf: '/docs/vanderbilt_self_form.pdf',
      docx: '/docs/vanderbilt_self_form.docx',
    },
  ];

  return (
    <Section
      id="questionnaires"
      background="default"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="questionnaires-heading"
    >
      <SectionHeader
        title={t('questionnaires.title')}
        subtitle={t('questionnaires.subtitle')}
        titleId="questionnaires-heading"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {questionnaires.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full shadow-md border-0" data-testid={`card-questionnaire-${item.id}`}>
              <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mb-4"
                  aria-hidden="true"
                >
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2" data-testid={`text-title-${item.id}`}>{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4" data-testid={`text-desc-${item.id}`}>{item.description}</p>

                <p className="text-sm font-medium text-foreground mb-3" data-testid={`text-download-label-${item.id}`}>{t('questionnaires.download_files')}</p>

                <div className="flex items-center justify-center gap-4">
                  <a
                    href={item.docx}
                    download
                    className="flex flex-col items-center gap-1 group"
                    data-testid={`download-docx-${item.id}`}
                    title={t('questionnaires.download_word')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#2B579A]/10 group-hover:bg-[#2B579A]/20 transition-colors">
                      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                        <rect x="2" y="2" width="28" height="28" rx="4" fill="#2B579A"/>
                        <text x="16" y="21" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">W</text>
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground">{t('questionnaires.download_word')}</span>
                  </a>

                  <a
                    href={item.pdf}
                    download
                    className="flex flex-col items-center gap-1 group"
                    data-testid={`download-pdf-${item.id}`}
                    title={t('questionnaires.download_pdf')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#D32F2F]/10 group-hover:bg-[#D32F2F]/20 transition-colors">
                      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                        <rect x="2" y="2" width="28" height="28" rx="4" fill="#D32F2F"/>
                        <text x="16" y="21" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">PDF</text>
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground">{t('questionnaires.download_pdf')}</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center text-muted-foreground text-sm sm:text-base mt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        data-testid="text-questionnaires-note"
      >
        {t('questionnaires.note')}
      </motion.p>
    </Section>
  );
};

export default QuestionnairesSection;
