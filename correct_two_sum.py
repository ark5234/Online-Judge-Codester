def twoSum(nums, target):
    """
    Find two numbers in the array that add up to the target.
    Return their indices.
    """
    # Use a hash map to store numbers and their indices
    num_map = {}
    
    for i, num in enumerate(nums):
        # Calculate the complement needed
        complement = target - num
        
        # If complement exists in map, we found our pair
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number and its index
        num_map[num] = i
    
    # No solution found (though problem guarantees one exists)
    return []

# Test cases
if __name__ == "__main__":
    # Test case 1: [2,7,11,15], target = 9
    nums1 = [2, 7, 11, 15]
    target1 = 9
    result1 = twoSum(nums1, target1)
    print(f"Input: nums = {nums1}, target = {target1}")
    print(f"Output: {result1}")
    print(f"Explanation: Because nums[{result1[0]}] + nums[{result1[1]}] == {target1}")
    print()
    
    # Test case 2: [3,2,4], target = 6
    nums2 = [3, 2, 4]
    target2 = 6
    result2 = twoSum(nums2, target2)
    print(f"Input: nums = {nums2}, target = {target2}")
    print(f"Output: {result2}")
    print()
    
    # Test case 3: [3,3], target = 6
    nums3 = [3, 3]
    target3 = 6
    result3 = twoSum(nums3, target3)
    print(f"Input: nums = {nums3}, target = {target3}")
    print(f"Output: {result3}") 