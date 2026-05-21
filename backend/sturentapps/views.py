from django.shortcuts import render, redirect
from django.http import HttpResponse

from .models import Customer
from django.forms import inlineformset_factory
from django.shortcuts import render, get_object_or_404
from .models import *

from .forms import OrderForm, CreateUserForm

from .filters import OrderFilter

from django.contrib.auth.forms import UserCreationForm  # for registering a new user

from django.contrib.auth.models import User

from django.contrib import messages

from django.contrib.auth import authenticate,login,logout

from django.contrib.auth.decorators import login_required
# Create your views here.



# @login_required(login_url="login")
def home(request):
    orders=Order.objects.all()
    customers=Customer.objects.all()
    
    
    total_customers= customers.count()
    total_orders =Order.objects.all().count()
    delivered=Order.objects.filter(status='Delivered').count()
    pending=Order.objects.filter(status='Pending').count()

    context = {'orders':orders,'customers':customers,'total_orders':total_orders,
               'total_customers':total_customers,'delivered':delivered,
               'pending':pending}

    return render(request, 'sturentapps/dashboard.html', context)

@login_required(login_url="login")
def products(request):
    products=Products.objects.all()
    return render(request, 'sturentapps/products.html', {"products":products})

@login_required(login_url="login")
def customer(request,pk):
    
    customer=Customer.objects.get(id=pk)
    orders = customer.order_set.all()
    order_count= orders.count()
    
    myFilter= OrderFilter(request.GET, queryset=orders) #searching or filtering of orders

    context= {'customer':customer, 'orders':orders,'order_count':order_count, "myFilter":myFilter}
    return render(request,"sturentapps/customer.html",context)

@login_required(login_url="login")
def createOrder(request,pk):
    OrderFormSet= inlineformset_factory(Customer,Order,fields=('product','status'),extra=5)  # creating formset with 5 extra forms 
    customer=Customer.objects.get(id=pk)
    formset = OrderFormSet(queryset=Order.objects.none(),instance=customer)
    #form =OrderForm(initial={'customer':customer})
    if request.method=='POST': # post method is in the request and order_form.html is in the template
        # print("printing post", request.POST)
        #form = OrderForm(request.POST)
        formset = OrderFormSet(request.POST, instance=customer)
        if formset.is_valid():  
            formset.save()  # saves the input of the form
            return redirect("/") # to return home page(dashboard)
 
    context={"formset":formset}  # saving as form to pass in render

    return render(request,"sturentapps/order_form.html",context)
@login_required(login_url="login")
def updateOrder(request,pk): # pk is the primary key of the order
    # order = get_object_or_404(Order, pk=pk)
    order = Order.objects.get(id=pk)
    # if request.method == 'POST':
    #     # If the form is submitted, process the form data
    #     form = OrderForm(request.POST, instance=order)
    #     if form.is_valid():
    #         form.save()
    # else:
    #     # If it's a GET request, create a form with the current order data
    #     form = OrderForm(instance=order)

    # context = {"form": form}
    # return render(request, "sturentapps/order_form.html", context)
    #--- save
    if request.method=='POST': # post method is in the request and order_form.html is in the template
        # print("printing post", request.POST)
        form = OrderForm(request.POST, instance=order)
        if form.is_valid():  
            form.save()  # saves the input of the form
            return redirect("/") # to return home page(dashboard)

    form = OrderForm(instance=order)
    context={"form":form}
    return render (request,"sturentapps/order_form.html",context) # to return order_form.html 


@login_required(login_url="login")
def deleteOrder(request,pk):
    order = Order.objects.get(id=pk)
    if request.method=='POST':
        order.delete()
        return redirect("/")
    context={"item":order}
    
    return render(request, "sturentapps/delete.html",context)



def registerPage(request):
    if request.user.is_authenticated:
        return redirect("home")

    else:

        form = CreateUserForm()

        if request.method == 'POST':
            form = CreateUserForm(request.POST)
            if form.is_valid():
                form.save()
                user = form.cleaned_data.get("username")
                messages.success(request,"Account was created for " +user)
                return redirect("login")
            
        
        context={"form":form}
        return render(request,"sturentapps/register.html",context)



def loginPage(request):
    if request.user.is_authenticated:
        return redirect("home")

    else:


        if request.method == "POST":
            username=request.POST.get("username")
            password=request.POST.get("password")
            user= authenticate(request, username =username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                messages.info(request, "Username or Password is incorrect")
        
        context={}
        return render(request,"sturentapps/login.html",context)


@login_required(login_url="login")
def logoutUser(request):
    logout(request)
    return redirect("login")

