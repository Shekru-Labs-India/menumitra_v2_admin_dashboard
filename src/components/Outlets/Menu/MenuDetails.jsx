import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faCircleCheck,
  faCircleXmark,
  faCalendarPlus,
  faCalendarCheck,
  faUser,
  faChevronLeft,
  faFire,
  faPercent,
  faList,
  faStar,
  faLeaf,
  faDrumstickBite,
  faEgg,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';
import DeleteConfirmModal from '../../common/DeleteConfirmModal/DeleteConfirmModal';
import Breadcrumb from '../../Breadcrumb';

function MenuDetails() {
  const { outletId, menuId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (!adminData?.user_id || !menuId || !outletId) return;
      
      setError(null);
      try {
        const token = getToken();
        const response = await axios.post(
          'https://menu4.xyz/v2/common/menu_view',
          {
            menu_id: Number(menuId),
            outlet_id: Number(outletId),
            user_id: adminData?.user_id,
            app_source: 'admin_app',
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );
        setMenu(response.data.detail);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu details');
      }
    };

    fetchMenuDetails();
  }, [adminData?.user_id, menuId, outletId]);

  const handleDeleteMenu = async () => {
    try {
      const token = getToken();
      await axios.delete('https://menu4.xyz/v2/common/menu_delete', {
        data: {
          menu_id: Number(menuId),
          outlet_id: Number(outletId),
          user_id: adminData?.user_id,
          app_source: 'admin_app'
        },
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu');
      setShowDeleteModal(false);
    }
  };

  // Add breadcrumb items function
  const getBreadcrumbItems = () => [
    { label: 'Home', path: '/home' },
    { label: 'Outlets', path: '/outlets' },
    { label: menu?.outlet_name || 'Outlet', path: `/view-outlet/${outletId}` },
    { label: 'Menus', path: `/menus/${outletId}` },
    { label: menu?.name || 'Menu Details' }
  ];

  if (error) return <div className="text-error-500">{error}</div>;
  if (!menu) return null;

  return (
    <div className="">
      {/* Add Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            {/* Center - Title */}
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Menu Details
            </div>
            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-menu/${outletId}/${menuId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Image Preview Section */}
            {menu.images && menu.images.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {menu.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative w-full aspect-square border border-gray-200 rounded-lg p-2 bg-white"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={image.image}
                          alt={`${menu.name} - Image ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Menu Name - Always show */}
              <div className="flex items-center p-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-brand-500" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{menu.name}</div>
                  <div className="text-sm text-gray-500">Menu Name</div>
                </div>
              </div>

              {/* Food Type - Always show */}
              <div className="flex items-center p-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon 
                    icon={
                      menu.food_type === 'veg' ? faLeaf :
                      menu.food_type === 'nonveg' ? faDrumstickBite :
                      menu.food_type === 'vegan' ? faSeedling :
                      menu.food_type === 'egg' ? faEgg :
                      faLeaf
                    } 
                    className={`w-5 h-5 ${
                      menu.food_type === 'veg' ? 'text-success-500' :
                      menu.food_type === 'nonveg' ? 'text-error-500' :
                      menu.food_type === 'vegan' ? 'text-emerald-500' :
                      menu.food_type === 'egg' ? 'text-amber-500' :
                      'text-success-500'
                    }`} 
                  />
                </div>
                <div className="ml-3">
                  <div className={`text-base font-medium ${
                    menu.food_type === 'veg' ? 'text-success-500' :
                    menu.food_type === 'nonveg' ? 'text-error-500' :
                    menu.food_type === 'vegan' ? 'text-emerald-500' :
                    menu.food_type === 'egg' ? 'text-amber-500' :
                    'text-success-500'
                  }`}>
                    {menu.food_type?.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">Food Type</div>
                </div>
              </div>

              {/* Category - Always show */}
              <div className="flex items-center p-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon icon={faList} className="w-5 h-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{menu.category_name}</div>
                  <div className="text-sm text-gray-500">Category</div>
                </div>
              </div>

              {/* Special Status - Only if true */}
              {menu.is_special && (
                <div className="flex items-center p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-yellow-700">Special Menu</div>
                    <div className="text-sm text-gray-500">Menu Type</div>
                  </div>
                </div>
              )}

              {/* Spicy Index - Only if > 0 */}
              {menu.spicy_index > 0 && (
                <div className="flex items-center p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-error-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">Level {menu.spicy_index}</div>
                    <div className="text-sm text-gray-500">Spicy Index</div>
                  </div>
                </div>
              )}

              {/* Offer - Only if > 0 */}
              {menu.offer > 0 && (
                <div className="flex items-center p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPercent} className="w-5 h-5 text-success-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{menu.offer}%</div>
                    <div className="text-sm text-gray-500">Offer</div>
                  </div>
                </div>
              )}

              {/* Description - Only if not empty */}
              {menu.description?.trim() && (
                <div className="flex items-start p-3 sm:col-span-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faList} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium break-words">{menu.description}</div>
                    <div className="text-sm text-gray-500">Description</div>
                  </div>
                </div>
              )}

              {/* Ingredients - Only if not empty */}
              {menu.ingredients?.trim() && (
                <div className="flex items-start p-3 sm:col-span-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faList} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium break-words">{menu.ingredients}</div>
                    <div className="text-sm text-gray-500">Ingredients</div>
                  </div>
                </div>
              )}
            </div>

            {/* Portions Section - Only show if portions have valid data */}
            {menu.portions?.some(portion => portion.portion_name || portion.price || portion.unit_value || portion.unit_type) && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Portions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {menu.portions.map((portion, idx) => (
                    <div key={idx} className="flex items-center p-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium">{portion.portion_name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-500 font-medium">₹{portion.price}</span>
                          {(portion.unit_value || portion.unit_type) && (
                            <span className="text-sm text-gray-500">
                              {portion.unit_value} {portion.unit_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status and Meta Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Status */}
                <div className="flex items-center p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon 
                      icon={menu.is_active ? faCircleCheck : faCircleXmark} 
                      className={menu.is_active ? 'text-success-500' : 'text-error-500'} 
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{menu.is_active ? 'Active' : 'Inactive'}</div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                </div>

                {/* Created By */}
                <div className="flex items-center p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{menu.created_by}</div>
                    <div className="text-sm text-gray-500">Created By</div>
                  </div>
                </div>

                {/* Created On */}
                <div className="flex items-center p-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarPlus} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{menu.created_on}</div>
                    <div className="text-sm text-gray-500">Created On</div>
                  </div>
                </div>

                {/* Updated By - Show only if exists */}
                {menu.updated_by && (
                  <div className="flex items-center p-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{menu.updated_by}</div>
                      <div className="text-sm text-gray-500">Updated By</div>
                    </div>
                  </div>
                )}

                {/* Updated On - Show only if exists */}
                {menu.updated_on && (
                  <div className="flex items-center p-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCalendarCheck} className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{menu.updated_on}</div>
                      <div className="text-sm text-gray-500">Updated On</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteMenu}
      />
    </div>
  );
}

export default MenuDetails;