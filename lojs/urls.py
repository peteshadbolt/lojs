from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.conf import settings

import bibble.views

urlpatterns = patterns('',
    url(r'^$', bibble.views.index, name='index'),
    url(r'^simulate', bibble.views.simulate, name='simulate')
)

urlpatterns += staticfiles_urlpatterns()
