from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "owner", None) or getattr(obj, "user", None)
        return owner == request.user


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "owner", None) or getattr(obj, "user", None)
        return owner == request.user


class IsSharedWith(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.shares.filter(shared_with=request.user).exists()


class CanEditSharedTask(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.shares.filter(shared_with=request.user).exists()
        return obj.shares.filter(
            shared_with=request.user,
            permission="edit",
        ).exists()
