from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel

# Create your models here.
def validate_percent(value):
    if value > 100 or value < 0:
        raise ValidationError(
            _('%(value)s is not in range [0, 100]'),
            params={'value': value},
        )

class ApiReferenceModel(models.Model):

    name = models.CharField(max_length=100, default="api name", blank=True, null=True)

    local_api_url = models.CharField(
        max_length=1000, default="http://api_name_local/")

    public_api_url = models.CharField(
        max_length=1000, default="https://api_name_public/", blank=True, null=True)

    labels = models.ManyToManyField(LabelDataModel, related_name='labels')

    parameters = models.CharField(max_length=1000, default="parameters note", blank=True, null=True)

    percent_accept = models.IntegerField(validators=[validate_percent],
                                        default=80, verbose_name='percent accpect value')
    
    def __str__(self):
        return self.name + ' || ' + str(self.percent_accept) + '%'

    def post_request_api(self, parameters):
        return 'Jsonfile {}'

    def get_color_label(self, tag_label, type_label):
        try:
            color = self.labels.filter(
                tag_label=tag_label, type_label=type_label).first().color
        except Exception as e:
            print(e)
            color = "#F0F0F1"

        return color
        
