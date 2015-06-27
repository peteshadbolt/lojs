from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.conf import settings
from rest_framework import routers
import lojs.views

router = routers.DefaultRouter()

urlpatterns = patterns('',
    url(r'^api', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^$', lojs.views.index, name='index'),
    url(r'^simulate', lojs.views.simulate, name='simulate')
)

urlpatterns += staticfiles_urlpatterns()
