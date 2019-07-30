from django.contrib import admin
from django import forms
from .models import DataSetModel
from .submodels.metadata import MetaDataModel
from .submodels.inputdata import InputDataModel
from .submodels.outputdata import OutputDataModel
from .submodels.labeldata import LabelDataModel
from .submodels.boudingbox import BoundingBoxModel
# from .submodels.utils.ziprar import ZipRarExtractor
# from .submodels.utils.scanmeta import ScanMetaToDatabase
from .submodels.utils.groundtruth import GroundTruther
import os
import shutil
from django.conf import settings
import django.utils.safestring as safestring

class DataSetForm(forms.ModelForm):
	class Meta:
		model = DataSetModel
		fields = '__all__'

	def scanner_database(self, instance_dataset):
		"""
			Scanfile was extracted and add to database relationship
		"""
		if self.cleaned_data['type_labeling'] == 'de':
			from adminmaster.datamanagement.tasks import scanner_dataset
			scanner_dataset.delay(instance_dataset.id)
		elif self.cleaned_data['type_labeling'] == 'tr':	
			from adminmaster.datamanagement.tasks import extract_seqframevideo
			extract_seqframevideo.delay(instance_dataset.id)

		"""End of scan, Done!!"""
	

	def check_change_filezip(self, old, new):
		if old.count() != new.count():
			return True
		else:
			names_of_new = [i.get_zipname() for i in new]
			for i in old:
				if (not i.get_zipname() in names_of_new):
					return True
			return False
   
	def save(self, commit=True):
		instance_dataset = super(DataSetForm, self).save(commit=False)
		instance_dataset.save()
		if instance_dataset.id is None:
			self.scanner_database(instance_dataset)
		else:
			data = DataSetModel.objects.get(id=instance_dataset.id)
			if (self.check_change_filezip(data.input_file.all(), self.cleaned_data['input_file'])):
				self.scanner_database(instance_dataset)
				
 
		if(commit):
			instance_dataset.save()

		return instance_dataset

class DataSetAdmin(admin.ModelAdmin):
	#class Meta will not accept this form custom > find out why
	form = DataSetForm
	list_display = ('name',)
	readonly_fields = ['id', 'dir_path']  # , 'dir_path'

	fieldsets = [
		(None, 
				{
                    'fields': ['name', 'type_labeling', 'num_fps']
				}
		),
		('Settings Field',
				{
					'fields': ['input_file', 'labels']
				}
		),
		('More Information',
				{
				'fields': ['id', 'dir_path']
				}
		),
	]

class InputDataAdmin(admin.ModelAdmin):
	change_form_template = 'progressbarupload/change_form.html'
	add_form_template = 'progressbarupload/change_form.html'

   	# readonly_fields = ['owner', 'description', 'zipfile']

class OutputDataForm(forms.ModelForm):
	class Meta:
		model = OutputDataModel
		fields = '__all__'

	def compress_zip(self, path_file_export):
		shutil.make_archive(path_file_export, 'zip', path_file_export)

	def scanner_meta_annotated(self, instance_output):
		query_meta = MetaDataModel.objects.filter(
			dataset=instance_output.data_set,
			is_annotated=1
		)
		groundTruther = GroundTruther(instance_output, query_meta)
		return groundTruther.run()


	def save(self, commit=True):
		instance_output = super(OutputDataForm, self).save(commit=False)
		# instance_output.save()
		
		self.compress_zip(self.scanner_meta_annotated(instance_output))

		if(not commit):
			instance_output.save()

		return instance_output  

class OutputDataAdmin(admin.ModelAdmin):
	#class Meta will not accept this form custom > find out why

	list_display = ('name', 'download',)
	readonly_fields = ['id', 'file_path']

	fieldsets = [
		(None, 
				{
					'fields': ['name', 'owner']
				}
		),
		('Settings Field',
				{
					'fields': ['data_set', 'type_groundtruth', 'description']
				}
		),
		('More Information',
				{
				'fields': ['id', 'file_path']
				}
		),
	]

	form = OutputDataForm

	def get_readonly_fields(self, request, obj=None):
		if obj: # editing an existing object
			return self.readonly_fields + ['data_set',]
		return self.readonly_fields

class LabelDataForm(forms.ModelForm):
	class Meta:
		model = LabelDataModel
		fields = '__all__'

	def save(self, commit=True):
		instance_label = super(LabelDataForm, self).save(commit=False)
		instance_label.tag_label = self.cleaned_data['tag_label'].replace(' ', '_')
		if(not commit):
			instance_label.save()
		return instance_label

class LabelDataAdmin(admin.ModelAdmin):
	#class Meta will not accept this form custom > find out why

	fieldsets = [
		(None,
			{
				'fields': ['tag_label']
			}
			),
		('Settings Field',
			{
				'fields': ['type_label', 'color', ]
			}
			),
		('More Information',
			{
				'fields': ['description',]
			}
			),
	]

	form = LabelDataForm


# Register your models here.
admin.site.register(DataSetModel, DataSetAdmin)
admin.site.register(InputDataModel, InputDataAdmin)
admin.site.register(LabelDataModel, LabelDataAdmin)
# admin.site.register(BoundingBoxModel)
admin.site.register(MetaDataModel)
admin.site.register(OutputDataModel, OutputDataAdmin)
