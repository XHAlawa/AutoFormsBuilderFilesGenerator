# Auto Reactive Forms Builder Generator Based On Open Api 
Most of angular developers takes time on writeing form group objects
using formBuilder Helper class , which can take long time also in addition 
to backEnd services to handle forms.

how ever service can be auto generated using library like 'swagger-generate' 
but forms it's self doesn't auto generated 
so I decided to write a few files that helps me 
by generate all forms based on schemas in open-api or swagger json file.

all forms are generated using formBuilder helper in angular and handle many things
like form arrays and enums .

just by execute 'node index.js' and make sure you put you own config in swagger.

note: in case of you need to extend generated form builder just inhert from it
and start using it.
