# DataAnnotationTool
DataAnnotationTool

#Dinh huong:

##Upload model, source code: (theo cau truc)
```
--cau truc source code:

\modules:
	\--*folder
__init__.py
config.py
train.py
test.py
predict.py
README.md
```
```
import sys
...
getattr(sys.modules[__name__], "func_%s" % fieldname)()
```
##Font-end
```
--su dung bootstrap framework

```
# Completely drop db
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc"  -delete
