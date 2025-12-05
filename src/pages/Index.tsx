import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Index = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleGenerateWebsite = async () => {
    if (!aiDescription.trim()) {
      toast({
        title: "Ошибка",
        description: "Опишите, какой сайт вы хотите создать",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://functions.poehali.dev/89d39509-bd44-4b24-b180-919b5c3062ed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: aiDescription })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedWebsite(result.data);
        toast({
          title: "Готово!",
          description: "Ваш сайт успешно создан",
        });
      } else {
        throw new Error(result.error || 'Ошибка генерации');
      }
    } catch (error: any) {
      toast({
        title: "Ошибка генерации",
        description: error.message || "Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen gradient-cosmic">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🚀</div>
            <span className="text-2xl font-bold text-gradient">ПОЕХАЛИ</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#home" className="hover:text-primary transition-colors">Главная</a>
            <a href="#team" className="hover:text-primary transition-colors">О команде</a>
            <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
            <a href="#portfolio" className="hover:text-primary transition-colors">Портфолио</a>
            <a href="#blog" className="hover:text-primary transition-colors">Блог</a>
            <a href="#contact" className="hover:text-primary transition-colors">Контакты</a>
          </div>
          <Button 
            className="gradient-purple hover:opacity-90"
            onClick={() => setIsGeneratorOpen(true)}
          >
            Создать сайт с ИИ
          </Button>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Создаём сайты<br />
              <span className="text-gradient">будущего</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Разработка веб-приложений, которые выделяются. Превращаем идеи в цифровые продукты мирового уровня.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-purple hover:opacity-90 text-lg px-8"
                onClick={() => setIsGeneratorOpen(true)}
              >
                <Icon name="Rocket" className="mr-2" size={20} />
                Создать сайт за 1 минуту
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Смотреть работы
              </Button>
            </div>
          </div>
          <div className="mt-16 animate-float">
            <div className="text-8xl">🌌</div>
          </div>
        </div>
      </section>

      <section id="team" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4 animate-fade-in">О команде</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">Эксперты, которые делают невозможное возможным</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "Users", title: "15+ экспертов", desc: "Дизайнеры, разработчики, маркетологи" },
              { icon: "Award", title: "50+ проектов", desc: "Успешно запущенных приложений" },
              { icon: "Clock", title: "5 лет опыта", desc: "В разработке цифровых продуктов" }
            ].map((item, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary transition-all animate-scale-in">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-purple flex items-center justify-center">
                    <Icon name={item.icon as any} size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">Услуги</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">Полный цикл создания цифровых продуктов</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "Palette", title: "Веб-дизайн", desc: "Современные UI/UX решения для вашего бизнеса" },
              { icon: "Code", title: "Разработка", desc: "Frontend и Backend на современных технологиях" },
              { icon: "Smartphone", title: "Мобильные приложения", desc: "iOS и Android разработка" },
              { icon: "ShoppingCart", title: "E-commerce", desc: "Интернет-магазины с полным функционалом" },
              { icon: "LineChart", title: "SEO оптимизация", desc: "Продвижение и аналитика вашего сайта" },
              { icon: "Headphones", title: "Поддержка", desc: "Техподдержка 24/7 и обновления" }
            ].map((service, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary transition-all hover:scale-105">
                <CardContent className="p-6">
                  <Icon name={service.icon as any} size={40} className="text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">Портфолио</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">Проекты, которыми мы гордимся</p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { 
                title: "TechStartup Dashboard", 
                desc: "Панель управления для стартапа с real-time аналитикой",
                tags: ["React", "Node.js", "PostgreSQL"]
              },
              { 
                title: "Fashion E-commerce", 
                desc: "Интернет-магазин модной одежды с AI-рекомендациями",
                tags: ["Next.js", "Stripe", "AI"]
              },
              { 
                title: "HealthTech Platform", 
                desc: "Платформа для записи к врачам и телемедицины",
                tags: ["React Native", "Python", "WebRTC"]
              },
              { 
                title: "CryptoTrading Bot", 
                desc: "Автоматизированная система торговли криптовалютой",
                tags: ["Python", "ML", "Binance API"]
              }
            ].map((project, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-48 gradient-purple relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all flex items-center justify-center text-6xl">
                      {['💻', '🛍️', '🏥', '₿'][idx]}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground mb-4">{project.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">Блог</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">Делимся знаниями и опытом</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Тренды веб-дизайна 2024", 
                desc: "Какие стили и подходы будут актуальны в новом году",
                date: "15 декабря 2024",
                icon: "Sparkles"
              },
              { 
                title: "React vs Vue: что выбрать?", 
                desc: "Сравнение популярных фреймворков для вашего проекта",
                date: "10 декабря 2024",
                icon: "Code2"
              },
              { 
                title: "SEO в 2024: новые правила", 
                desc: "Как продвигать сайты после обновлений поисковиков",
                date: "5 декабря 2024",
                icon: "TrendingUp"
              }
            ].map((post, idx) => (
              <Card key={idx} className="bg-card border-border hover:border-primary transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <Icon name={post.icon as any} size={32} className="text-primary mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground">{post.desc}</p>
                  <Button variant="link" className="p-0 mt-4 text-primary">
                    Читать далее <Icon name="ArrowRight" size={16} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold text-center mb-4">Свяжитесь с нами</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Готовы начать ваш проект? Напишите нам!</p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Контактная информация</h3>
              <div className="space-y-4">
                <a 
                  href="https://t.me/FreeWebCreator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-primary transition-colors group"
                >
                  <Icon name="Send" className="text-primary mt-1 group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <p className="font-semibold">Telegram канал</p>
                    <p className="text-muted-foreground group-hover:text-primary/80">@FreeWebCreator</p>
                  </div>
                </a>
                <a 
                  href="https://t.me/+pJ_2ss_PeTplYzgy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-primary transition-colors group"
                >
                  <Icon name="MessageCircle" className="text-primary mt-1 group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <p className="font-semibold">Секретный чат</p>
                    <p className="text-muted-foreground group-hover:text-primary/80">Закрытое сообщество</p>
                  </div>
                </a>
                <a 
                  href="https://t.me/InfernoClient" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:text-primary transition-colors group"
                >
                  <Icon name="AtSign" className="text-primary mt-1 group-hover:scale-110 transition-transform" size={24} />
                  <div>
                    <p className="font-semibold">Связь напрямую</p>
                    <p className="text-muted-foreground group-hover:text-primary/80">@InfernoClient</p>
                  </div>
                </a>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Имя</label>
                    <Input
                      placeholder="Введите ваше имя"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Сообщение</label>
                    <Textarea
                      placeholder="Расскажите о вашем проекте..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      rows={5}
                      className="bg-background border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-purple hover:opacity-90">
                    <Icon name="Send" className="mr-2" size={18} />
                    Отправить заявку
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-2xl">🚀</div>
            <span className="text-xl font-bold text-gradient">ПОЕХАЛИ</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Создаём цифровое будущее вместе
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 POEHALI.DEV. Все права защищены.
          </p>
        </div>
      </footer>

      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gradient flex items-center gap-2">
              <Icon name="Sparkles" size={32} />
              ИИ-Генератор сайтов
            </DialogTitle>
            <DialogDescription className="text-lg">
              Опишите ваш проект — ИИ создаст структуру сайта за минуту
            </DialogDescription>
          </DialogHeader>

          {!generatedWebsite ? (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Опишите ваш сайт
                </label>
                <Textarea
                  placeholder="Например: Сайт для кофейни с уютной атмосферой, меню, галереей и формой бронирования столиков"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  rows={6}
                  className="bg-background border-border text-base"
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Lightbulb" size={18} />
                  Примеры описаний:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Лендинг для фитнес-клуба с тарифами и расписанием</li>
                  <li>Портфолио фотографа с галереей работ</li>
                  <li>Сайт-визитка юридической компании</li>
                  <li>Интернет-магазин hand-made украшений</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateWebsite}
                disabled={isGenerating}
                className="w-full gradient-purple hover:opacity-90 text-lg py-6"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                    Генерирую сайт...
                  </>
                ) : (
                  <>
                    <Icon name="Wand2" className="mr-2" size={20} />
                    Создать сайт
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="bg-gradient-purple p-6 rounded-lg text-center">
                <Icon name="CheckCircle2" size={48} className="mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{generatedWebsite.title}</h3>
                <p className="text-foreground/90">{generatedWebsite.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Icon name="Layers" size={20} />
                    Структура сайта:
                  </h4>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="font-semibold">Главный экран:</p>
                        <p className="text-sm text-muted-foreground">{generatedWebsite.hero?.title}</p>
                      </div>
                      {generatedWebsite.features && (
                        <div>
                          <p className="font-semibold">Преимущества: {generatedWebsite.features.length} блоков</p>
                        </div>
                      )}
                      {generatedWebsite.about && (
                        <div>
                          <p className="font-semibold">О компании</p>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">Контакты</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setGeneratedWebsite(null);
                      setAiDescription('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Icon name="RefreshCw" className="mr-2" size={18} />
                    Создать другой
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Сохранено!",
                        description: "Проект добавлен в ваш аккаунт"
                      });
                      setIsGeneratorOpen(false);
                    }}
                    className="flex-1 gradient-purple"
                  >
                    <Icon name="Download" className="mr-2" size={18} />
                    Сохранить проект
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;