from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.conf import settings
from rest_framework import routers
import bibble.views

router = routers.DefaultRouter()
router.register(r"users", bibble.views.UserViewSet)
router.register(r"groups", bibble.views.GroupViewSet)

urlpatterns = patterns('',
    url(r'^$', bibble.views.index, name='index'),
    url(r'^simulate', bibble.views.simulate, name='simulate'),
    url(r'^api', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
)

urlpatterns += staticfiles_urlpatterns()
